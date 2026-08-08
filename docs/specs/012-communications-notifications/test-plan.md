# Test Plan — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo                 | Valor                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                               |
| Spec ID               | 012                                                                                         |
| Módulo                | Communications and Notifications                                                            |
| Documento             | Test Plan                                                                                   |
| Ruta                  | `docs/specs/012-communications-notifications/test-plan.md`                                  |
| Versión               | 0.1                                                                                         |
| Estado                | Borrador inicial                                                                            |
| Fecha                 | 2026-07-19                                                                                  |
| Documento base        | `docs/specs/012-communications-notifications/spec.md`                                       |
| Plan técnico          | `docs/specs/012-communications-notifications/plan.md`                                       |
| Modelo de datos       | `docs/specs/012-communications-notifications/data-model.md`                                 |
| Contrato API          | `docs/specs/012-communications-notifications/api-contract.md`                               |
| Tipo de pruebas       | Unitarias, integración, API, autorización, multitenancy, privacidad, seguridad, OpenAPI, CI |
| Naturaleza del módulo | Tenant-scoped / Audience-aware / Event-aware / Channel-aware / Public-safe / Auditable      |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `012-communications-notifications`.

El objetivo es asegurar que la implementación de comunicaciones y notificaciones cumpla con:

* aislamiento por tenant;
* autorización por permiso;
* autorización por recurso propio;
* control de audiencia;
* visibilidad pública segura;
* no exposición de comunicados privados;
* no exposición pública de notificaciones;
* notificaciones in-app;
* plantillas de notificación;
* preferencias de usuario;
* intentos de entrega;
* destination masking;
* idempotencia;
* auditoría;
* observabilidad segura;
* integración pública WordPress;
* compatibilidad con OpenAPI;
* cumplimiento de CI/CD.

Regla central:

```text id="8nyw6k"
El módulo de comunicaciones y notificaciones debe impedir exposición indebida de contenido privado, notificaciones ajenas, destinatarios internos y datos sensibles, manteniendo trazabilidad, idempotencia y aislamiento por tenant.
```

---

## 3. Alcance del plan de pruebas

Este plan cubre:

```text id="empu3l"
Unit tests
Domain tests
Value object tests
DTO validation tests
Application service tests
Use case tests
Repository integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Audience resolution tests
Public WordPress tests
Notification delivery tests
Notification preference tests
Notification idempotency tests
Template rendering tests
Destination masking tests
Audit integration tests
Observability tests
Security tests
OpenAPI tests
Smoke tests
CI/CD validation
```

---

## 4. Fuera del alcance de este plan

No se probará en esta spec:

```text id="cawlyx"
- WhatsApp real en producción.
- SMS real en producción.
- Push mobile real.
- Webhooks salientes avanzados.
- n8n workflows avanzados.
- Campañas de marketing.
- Constructor visual de plantillas.
- Editor WYSIWYG avanzado.
- Firma electrónica.
- Confirmación legal certificada.
- Chat bidireccional.
- Foros comunitarios.
- Comentarios.
- Encuestas.
- Votaciones.
- IA con datos reales.
- Traducción automática.
- Análisis de sentimiento.
- Proveedores externos reales en pruebas unitarias.
```

Estos aspectos deben cubrirse en specs futuras.

---

## 5. Estrategia general de pruebas

La estrategia se organiza por capas:

```text id="a1wtv1"
1. Unit tests: value objects, entidades, reglas puras.
2. DTO validation tests: entradas HTTP.
3. Application tests: servicios y casos de uso.
4. Repository integration tests: PostgreSQL/Prisma.
5. API tests: endpoints REST.
6. Authorization tests: permisos y roles.
7. Own-resource tests: /me y recursos propios.
8. Multitenancy tests: aislamiento entre tenants.
9. Public safety tests: WordPress y endpoints públicos.
10. Delivery tests: notificaciones, delivery attempts, email/noop.
11. Security tests: privacidad, masking, logs, metadata.
12. OpenAPI tests: contrato documentado.
13. Smoke tests: validación mínima end-to-end.
```

---

## 6. Reglas obligatorias de datos de prueba

No usar:

```text id="eqg8w4"
nombres reales de residentes
emails reales
teléfonos reales
cédulas reales
direcciones reales
comunicados privados reales
comprobantes reales
evidencias reales
tokens reales
cookies reales
secretos reales
credenciales SMTP reales
credenciales SES reales
credenciales SendGrid reales
credenciales WhatsApp reales
provider message IDs reales
URLs firmadas reales
datos financieros reales
```

Usar únicamente:

```text id="xj6rji"
tenants sintéticos
usuarios sintéticos
unidades sintéticas
personas sintéticas
emails de ejemplo
teléfonos ficticios
contenidos ficticios
proveedores mock/noop
delivery attempts falsos
traceIds sintéticos
```

Ejemplos válidos:

```text id="m61duu"
tenant-a
tenant-b
owner.a@example.test
resident.a@example.test
+593999000001
Unidad A-101
Unidad B-202
```

---

## 7. Datos base para pruebas

### 7.1. Tenants

```text id="jpwuh8"
Tenant A:
- id: tenant_a
- slug: altos-del-norte
- status: active

Tenant B:
- id: tenant_b
- slug: jardines-del-valle
- status: active

Tenant Suspended:
- id: tenant_suspended
- slug: portal-suspendido
- status: suspended
```

---

### 7.2. Usuarios

```text id="f98ym1"
platformAdmin
tenantAdminA
communicationManagerA
treasurerA
reservationManagerA
sanctionManagerA
ownerUserA
residentUserA
residentUserA2
tenantAdminB
residentUserB
disabledUserA
noPermissionUserA
```

---

### 7.3. Unidades

```text id="lr2nut"
propertyUnitA101
propertyUnitA102
propertyUnitB201
```

Relaciones:

```text id="heoj1u"
ownerUserA -> propertyUnitA101
residentUserA -> propertyUnitA101
residentUserA2 -> propertyUnitA102
residentUserB -> propertyUnitB201
```

---

### 7.4. Comunicados

```text id="osmwze"
communicationDraftA
communicationScheduledA
communicationPublishedTenantA
communicationPublishedPrivateA
communicationPublishedInternalA
communicationPublicVisibleA
communicationPublicNotVisibleA
communicationExpiredPublicA
communicationArchivedA
communicationCancelledA
communicationTenantB
```

---

### 7.5. Notificaciones

```text id="cy1uvy"
notificationInAppOwnerA
notificationInAppResidentA
notificationEmailOwnerA
notificationFailedEmailA
notificationReadA
notificationArchivedA
notificationTenantB
```

---

### 7.6. Plantillas

```text id="qvua37"
templateReservationApprovedInApp
templateFineIssuedInApp
templatePaymentConfirmedInApp
templateStatementPublishedInApp
templateGenericEmail
templateInactiveA
templateSystemA
templateTenantB
templateGlobal
```

---

### 7.7. Preferencias

```text id="as6262"
preferenceOwnerInformationalEmailDisabled
preferenceOwnerReservationInAppEnabled
preferenceResidentFinancialEmailEnabled
preferenceResidentSecurityInAppEnabled
preferenceTenantB
```

---

## 8. Matriz de cobertura funcional

| Requisito                             | Tipo de prueba                       |
| ------------------------------------- | ------------------------------------ |
| Crear comunicado                      | Unit, application, API               |
| Editar comunicado                     | Unit, application, API               |
| Publicar comunicado                   | Unit, application, API, audit        |
| Programar comunicado                  | Unit, application, API               |
| Cancelar comunicado                   | Unit, application, API               |
| Archivar comunicado                   | Unit, application, API               |
| Gestionar audiencia                   | Unit, integration, API, multitenancy |
| Consultar comunicados administrativos | Repository, API                      |
| Consultar comunicados propios         | Application, API, own-resource       |
| Marcar comunicado como leído          | Application, API, idempotency        |
| Consultar comunicados públicos        | Public integration, security         |
| Crear plantilla                       | Unit, API                            |
| Validar variables de plantilla        | Unit, application                    |
| Crear notificación                    | Application, API                     |
| Enviar notificación                   | Application, delivery                |
| Reintentar notificación               | Application, delivery                |
| Cancelar notificación                 | Application, API                     |
| Consultar notificaciones propias      | API, own-resource                    |
| Marcar notificación como leída        | API, own-resource                    |
| Gestionar preferencias                | API, own-resource                    |
| Registrar delivery attempts           | Integration, security                |
| Enmascarar destinos                   | Unit, security                       |
| Evitar duplicados                     | Unit, integration, API               |
| Auditar eventos                       | Integration                          |
| OpenAPI                               | Contract tests                       |

---

# 9. Unit tests — Value Objects

## 9.1. CommunicationStatus

### Casos

```text id="wk1j2c"
- acepta draft
- acepta scheduled
- acepta published
- acepta expired
- acepta archived
- acepta cancelled
- rechaza estado desconocido
- identifica estados editables
- identifica estados publicables
- identifica estados terminales
```

### Resultado esperado

* `draft` y `scheduled` son editables.
* `draft` y `scheduled` son publicables.
* `archived` y `cancelled` no son publicables.
* Estado inválido lanza error de dominio.

---

## 9.2. CommunicationVisibility

### Casos

```text id="ojzj8a"
- acepta private
- acepta internal
- acepta tenant
- acepta public
- identifica si puede exponerse a WordPress
- rechaza valor desconocido
```

### Resultado esperado

Solo `public` permite exposición pública, siempre que se cumplan estado y `isPublicVisible`.

---

## 9.3. CommunicationCategory

### Casos

```text id="nhqoko"
- acepta general
- acepta administrative
- acepta financial
- acepta maintenance
- acepta security
- acepta community
- acepta reservation
- acepta fine
- acepta meeting
- acepta emergency
- acepta other
- rechaza valor desconocido
```

---

## 9.4. CommunicationPriority

### Casos

```text id="lklp52"
- acepta low
- acepta normal
- acepta high
- acepta urgent
- rechaza valor desconocido
```

---

## 9.5. AudienceType

### Casos

```text id="ac6ifb"
- acepta allTenantUsers
- acepta owners
- acepta residents
- acepta propertyUnits
- acepta roles
- acepta specificUsers
- acepta mixed
- rechaza valor desconocido
```

---

## 9.6. CommunicationRecipientType

### Casos

```text id="flx3ov"
- user requiere userId
- person requiere personId
- propertyUnit requiere propertyUnitId
- role requiere roleId
- owner no requiere ID
- resident no requiere ID
- allTenantUsers no requiere ID
- rechaza combinaciones inválidas
```

---

## 9.7. CommunicationTitle

### Casos

```text id="nyutxv"
- acepta título válido
- rechaza vacío
- rechaza solo espacios
- rechaza longitud excesiva
- normaliza espacios
- rechaza contenido peligroso si aplica
```

---

## 9.8. CommunicationBody

### Casos

```text id="jehpbb"
- acepta body válido
- rechaza vacío
- rechaza longitud excesiva
- sanitiza HTML permitido
- bloquea script
- bloquea iframe
- bloquea event handlers inline
```

---

## 9.9. NotificationStatus

### Casos

```text id="n2tot1"
- acepta pending
- acepta sent
- acepta delivered
- acepta failed
- acepta read
- acepta archived
- acepta cancelled
- identifica estados terminales
- identifica estados leíbles
- rechaza desconocido
```

---

## 9.10. NotificationChannel

### Casos

```text id="vkc20v"
- acepta inApp
- acepta email
- acepta whatsapp
- acepta sms
- acepta push
- acepta webhook
- identifica canales MVP
- identifica canales diferidos
```

Resultado esperado:

```text id="kpbegs"
inApp = obligatorio MVP
email = opcional MVP
whatsapp/sms/push/webhook = diferidos
```

---

## 9.11. NotificationTemplateCode

### Casos

```text id="o72pu7"
- acepta PAYMENT_CONFIRMED
- acepta RESERVATION_APPROVED
- acepta FINE_ISSUED
- rechaza vacío
- rechaza espacios
- rechaza caracteres peligrosos
- rechaza longitud excesiva
```

---

## 9.12. MaskedDestination

### Casos email

```text id="n305do"
gustavo@example.com -> g*****o@example.com
admin@resident.com -> a***n@resident.com
a@x.com -> a***@x.com
```

### Casos teléfono

```text id="ow8gfd"
+593987654321 -> +593*******321
0987654321 -> *******321
```

### Resultado esperado

* Nunca retorna destino completo.
* Nunca retorna null si el canal externo requiere destino.
* Respeta formato seguro.

---

# 10. Unit tests — Entidades

## 10.1. Communication entity

### Casos

```text id="aj3fzr"
- crea comunicado draft válido
- rechaza comunicado sin tenantId
- rechaza comunicado sin title
- rechaza comunicado sin body
- rechaza comunicado sin visibility
- rechaza comunicado no público sin audiencia cuando aplica
- permite public + isPublicVisible true
- bloquea isPublicVisible true si visibility != public
- cambia estado draft -> published
- cambia estado draft -> scheduled
- cambia estado scheduled -> published
- cambia estado draft -> cancelled
- cambia estado published -> archived
- rechaza archived -> published
- rechaza cancelled -> published
- rechaza published -> draft
```

---

## 10.2. CommunicationRecipient entity

### Casos

```text id="dsckw7"
- crea recipient allTenantUsers sin ID
- crea recipient owner sin ID
- crea recipient resident sin ID
- crea recipient user con userId
- crea recipient person con personId
- crea recipient propertyUnit con propertyUnitId
- crea recipient role con roleId
- rechaza recipient user sin userId
- rechaza recipient propertyUnit sin propertyUnitId
- rechaza recipient role sin roleId
```

---

## 10.3. CommunicationReadReceipt entity

### Casos

```text id="h0awmc"
- crea receipt válido
- rechaza sin tenantId
- rechaza sin communicationId
- rechaza sin userId
- readAt se establece
- no permite duplicado lógico
```

---

## 10.4. NotificationTemplate entity

### Casos

```text id="jo5xee"
- crea template inApp válida
- crea template email con subjectTemplate
- rechaza template email sin subjectTemplate
- rechaza template sin code
- rechaza template sin bodyTemplate
- rechaza variables no declaradas
- bloquea uso si status inactive
- bloquea edición ordinaria si isSystem true
```

---

## 10.5. Notification entity

### Casos

```text id="o0348p"
- crea notificación inApp válida
- rechaza sin tenantId
- rechaza sin recipientUserId
- rechaza sin title
- rechaza sin body
- genera idempotencyKey esperada
- permite pending -> delivered
- permite delivered -> read
- permite pending -> cancelled
- rechaza read -> delivered
- rechaza archived -> read
```

---

## 10.6. NotificationDeliveryAttempt entity

### Casos

```text id="ayryus"
- crea attempt email con destinationMasked
- rechaza canal externo sin destinationMasked
- permite inApp sin provider
- attemptNumber inicia en 1
- attemptNumber debe ser >= 1
- pending -> sent
- sent -> delivered
- sent -> failed
- pending -> skipped
- errorMessage se sanitiza
```

---

## 10.7. NotificationPreference entity

### Casos

```text id="la4v7r"
- crea preferencia válida
- rechaza sin tenantId
- rechaza sin userId
- rechaza sin category
- rechaza sin channel
- permite desactivar informational email
- bloquea desactivar security inApp si política lo impide
- bloquea desactivar mandatory si política lo impide
```

---

# 11. DTO validation tests

## 11.1. CreateCommunicationDto

### Casos válidos

```text id="fnpula"
- title + body + category + visibility + audienceType
- public con isPublicVisible true
- tenant con recipients allTenantUsers
- mixed con recipients user/propertyUnit/role
```

### Casos inválidos

```text id="d9pcdm"
- title vacío
- body vacío
- visibility inválida
- category inválida
- priority inválida
- audienceType inválida
- isPublicVisible true con visibility != public
- recipients con user sin userId
- recipients con propertyUnit sin propertyUnitId
- tenantId en body
- createdBy en body
- status en body
```

---

## 11.2. UpdateCommunicationDto

### Casos

```text id="nxsouo"
- actualiza title
- actualiza summary
- actualiza body
- actualiza priority
- rechaza status manual
- rechaza publishedAt manual
- rechaza tenantId
- rechaza createdBy
- rechaza recipients si se deben manejar en endpoint separado
```

---

## 11.3. UpdateCommunicationRecipientsDto

### Casos

```text id="vibsuq"
- recipients allTenantUsers válido
- recipients role válido
- recipients propertyUnit válido
- recipients user válido
- mixed válido
- recipientType inválido falla
- IDs faltantes fallan
- payload vacío falla si audiencia no pública
```

---

## 11.4. CreateNotificationTemplateDto

### Casos

```text id="wdc080"
- inApp sin subjectTemplate permitido
- email con subjectTemplate permitido
- email sin subjectTemplate falla
- code inválido falla
- variablesSchema inválido falla
- bodyTemplate con variable no declarada falla
- channel inválido falla
```

---

## 11.5. CreateNotificationDto

### Casos

```text id="oqpfse"
- notificación manual inApp válida
- notificación email válida si canal permitido
- recipientUserId obligatorio
- title obligatorio
- body obligatorio
- channel válido
- category válida
- actionUrl relativa válida
- actionUrl externa no permitida falla salvo allowlist
- tenantId en body falla
- status en body falla
```

---

## 11.6. NotificationPreference DTOs

### Casos

```text id="wbgy6p"
- lista de preferencias válida
- categoría inválida falla
- canal inválido falla
- isEnabled requerido
- userId en body falla
- tenantId en body falla
```

---

# 12. Application service tests

## 12.1. CommunicationService

### Casos

```text id="ad9ctu"
- crea comunicado draft
- actualiza comunicado draft
- actualiza comunicado scheduled
- rechaza actualización de published si política lo impide
- rechaza comunicación de otro tenant
- valida slug duplicado
- audita creación
- audita actualización
```

---

## 12.2. CommunicationAudienceService

### Casos

```text id="t58wsj"
- resuelve allTenantUsers
- resuelve owners
- resuelve residents
- resuelve propertyUnits
- resuelve roles
- resuelve specificUsers
- resuelve mixed sin duplicar usuarios finales
- rechaza userId de otro tenant
- rechaza personId de otro tenant
- rechaza propertyUnitId de otro tenant
- rechaza roleId de otro tenant
- determina que ownerUserA accede a communicationTenantA
- determina que residentUserB no accede a communicationTenantA
```

---

## 12.3. CommunicationPublicationService

### Casos

```text id="dtuvwu"
- publica draft
- publica scheduled
- rechaza published -> draft
- rechaza archived -> published
- rechaza cancelled -> published
- valida audiencia antes de publicar
- valida public-safe si isPublicVisible true
- registra publishedAt
- registra publishedBy
- genera notificaciones si notifyAudience = true
- audita publicación
```

---

## 12.4. CommunicationReadReceiptService

### Casos

```text id="y9bkm6"
- marca lectura de comunicado accesible
- operación es idempotente
- no duplica receipt
- rechaza lectura de comunicado ajeno
- rechaza lectura de comunicado draft
- rechaza lectura de otro tenant
```

---

## 12.5. PublicAnnouncementService

### Casos

```text id="nsv398"
- lista published public visible
- oculta draft
- oculta scheduled
- oculta private
- oculta internal
- oculta tenant visibility
- oculta expired
- oculta archived
- oculta tenant suspendido
- response no incluye recipients
- response no incluye metadata interna
```

---

## 12.6. NotificationTemplateService

### Casos

```text id="f14xeq"
- crea template válida
- rechaza código duplicado
- permite template global si aplica
- valida subjectTemplate para email
- valida variablesSchema
- rechaza variables no declaradas
- activa template
- desactiva template
- archiva template
- bloquea edición de isSystem si política lo impide
- audita cambios
```

---

## 12.7. NotificationRenderingService

### Casos

```text id="cbkrz6"
- renderiza bodyTemplate con variables válidas
- renderiza subjectTemplate email
- falla con variables faltantes
- falla con variables extra no declaradas
- sanitiza salida
- bloquea script injection
- minimiza contenido por canal externo
```

---

## 12.8. NotificationService

### Casos

```text id="e0ra8q"
- crea notificación inApp
- crea notificación email pendiente
- crea notificación desde plantilla
- crea notificación manual
- rechaza recipient de otro tenant
- rechaza propertyUnitId de otro tenant
- aplica idempotencyKey
- no duplica notificación
- lista notificaciones admin
- lista notificaciones propias
- marca notificación propia como leída
- rechaza mark-read de notificación ajena
```

---

## 12.9. NotificationDeliveryService

### Casos

```text id="yqh6i8"
- entrega inApp como delivered
- crea delivery attempt para email
- email provider configured envía
- email provider no configurado registra skipped o failed controlado
- fallo provider no rompe transacción principal
- reintenta delivery hasta maxAttempts
- bloquea retry si maxAttempts excedido
- destinationMasked se guarda
- destino completo no se guarda
```

---

## 12.10. NotificationPreferenceService

### Casos

```text id="o3a9ta"
- consulta preferencias propias
- actualiza preferencias propias
- bloquea preferencia de otro usuario
- permite desactivar informational email
- bloquea desactivar mandatory/security si política lo impide
- aplica preferencia a envío no obligatorio
- ignora preferencia para mandatory si política lo permite
- audita cambios
```

---

## 12.11. NotificationIdempotencyService

### Casos

```text id="wv8x05"
- genera key notification:payment:payment_uuid:user_uuid:inApp
- genera key notification:reservation:reservation_uuid:user_uuid:email
- detecta duplicado existente
- permite retry sin duplicar notificación
- permite canales distintos para mismo evento
```

---

## 12.12. DestinationMaskingService

### Casos

```text id="vadmps"
- enmascara email normal
- enmascara email corto
- enmascara teléfono local
- enmascara teléfono internacional
- rechaza destino vacío en canal externo
- nunca devuelve destino completo
```

---

## 12.13. CommunicationAuditService

### Casos

```text id="gc7vxk"
- audita communication.created
- audita communication.published
- audita communication.audienceUpdated
- audita communication.read
- audita notification.created
- audita notification.failed
- audita notificationPreference.updated
- metadata no contiene body completo
- metadata no contiene email completo
- metadata no contiene tokens
```

---

# 13. Repository integration tests

## 13.1. PrismaCommunicationRepository

### Casos

```text id="wu988k"
- create communication
- find by id + tenant
- find by slug + tenant
- list by tenant
- filter by status
- filter by visibility
- filter by category
- filter public visible
- update status
- archive
- tenant A no ve tenant B
- slug único por tenant
```

---

## 13.2. PrismaCommunicationRecipientRepository

### Casos

```text id="dv2agr"
- replace recipients
- list recipients by communication
- archive old recipients
- validate tenantId
- query by userId
- query by propertyUnitId
- query by roleId
- tenant A no ve recipients B
```

---

## 13.3. PrismaCommunicationReadReceiptRepository

### Casos

```text id="xdz6jd"
- mark read creates receipt
- mark read repeated does not duplicate
- unique tenantId + communicationId + userId
- list receipts by communication
- tenant A no ve receipts B
```

---

## 13.4. PrismaNotificationTemplateRepository

### Casos

```text id="twd123"
- create template
- find template by id + tenant
- find active template by code/channel
- list templates by tenant
- code/channel unique per tenant
- global template lookup
- inactive template not returned as active
- archive template
- tenant A no ve template B
```

---

## 13.5. PrismaNotificationRepository

### Casos

```text id="n4xs53"
- create notification
- create notification idempotently
- repeated idempotencyKey does not duplicate
- list notifications by tenant
- list own notifications
- find by id + tenant
- find by id + tenant + recipientUserId
- mark read own
- mark all read own
- tenant A no ve notification B
```

---

## 13.6. PrismaNotificationDeliveryAttemptRepository

### Casos

```text id="mdg5y0"
- create attempt
- mark sent
- mark delivered
- mark failed
- mark skipped
- list by notification
- filter by channel
- filter by status
- attemptNumber >= 1
- destinationMasked required for external channel
- tenant A no ve attempts B
```

---

## 13.7. PrismaNotificationPreferenceRepository

### Casos

```text id="mf5tsy"
- upsert preference
- replace preferences
- find preference by user/category/channel
- unique tenantId + userId + category + channel
- list by user
- tenant A no ve preferences B
```

---

# 14. API tests — Communications administrativas

## 14.1. `GET /api/v1/tenant/communications`

### Casos

```text id="sxykox"
- 401 sin token
- 403 sin permiso communications.read
- 200 con permiso
- filtra por status
- filtra por visibility
- filtra por category
- filtra por priority
- pagina resultados
- no devuelve tenant B
```

---

## 14.2. `POST /api/v1/tenant/communications`

### Casos

```text id="mrrzfk"
- 401 sin token
- 403 sin permiso communications.create
- 201 crea draft
- 422 sin title
- 422 sin body
- 422 category inválida
- 422 visibility inválida
- 422 audiencia faltante en no público
- 422 tenantId en body
- 409 slug duplicado
- 403 recipient de otro tenant
- audit communication.created
```

---

## 14.3. `GET /api/v1/tenant/communications/{communicationId}`

### Casos

```text id="lkgkpf"
- 401 sin token
- 403 sin permiso
- 200 comunicado propio del tenant
- 404 comunicado inexistente
- 404/403 comunicado de otro tenant
```

---

## 14.4. `PATCH /api/v1/tenant/communications/{communicationId}`

### Casos

```text id="cksgup"
- 200 actualiza draft
- 200 actualiza scheduled
- 409 actualiza published si política lo bloquea
- 409 actualiza archived
- 422 intenta cambiar status genérico
- 422 intenta cambiar tenantId
- 422 contenido inseguro
- audit communication.updated
```

---

## 14.5. `POST /publish`

### Casos

```text id="p80jr8"
- 200 publica draft
- 200 publica scheduled
- 409 publica archived
- 409 publica cancelled
- 422 no público sin audiencia
- 422 public visible con reglas inválidas
- crea notifications si notifyAudience=true
- notifications son idempotentes
- audit communication.published
```

---

## 14.6. `POST /schedule`

### Casos

```text id="yonse5"
- 200 programa draft
- 422 publishAt faltante
- 422 publishAt pasado
- 409 programa published
- audit communication.scheduled
```

---

## 14.7. `POST /cancel`

### Casos

```text id="i5qecv"
- 200 cancela draft
- 200 cancela scheduled
- 409 cancela published si política lo bloquea
- 409 cancela archived
- audit communication.cancelled
```

---

## 14.8. `POST /archive`

### Casos

```text id="y0llk8"
- 200 archiva published
- 200 archiva expired
- 200 archiva cancelled
- 409 archiva ya archived
- archived no aparece en listados por defecto
- audit communication.archived
```

---

## 14.9. Recipients

### Endpoints

```text id="n8udlq"
GET /api/v1/tenant/communications/{communicationId}/recipients
PUT /api/v1/tenant/communications/{communicationId}/recipients
```

### Casos

```text id="mnj3cb"
- lista recipients con communications.read
- reemplaza recipients con communications.manageAudience
- rechaza userId de otro tenant
- rechaza personId de otro tenant
- rechaza propertyUnitId de otro tenant
- rechaza roleId de otro tenant
- rechaza update en communication published si política lo bloquea
- audit communication.audienceUpdated
```

---

## 14.10. Read receipts administrativos

### Endpoint

```text id="ypv0hu"
GET /api/v1/tenant/communications/{communicationId}/read-receipts
```

### Casos

```text id="ifnw8j"
- requiere communications.read
- lista receipts del tenant
- no lista receipts de tenant B
- pagina resultados
- filtra por rango de fechas
```

---

# 15. API tests — Communications propias `/me`

## 15.1. `GET /api/v1/me/communications`

### Casos

```text id="xbw6rh"
- 401 sin token
- 403 sin permiso communications.read.own
- 200 lista comunicados accesibles
- no devuelve draft
- no devuelve scheduled
- no devuelve archived
- no devuelve tenant B
- filtra unreadOnly
- filtra category
- pagina resultados
- DTO no incluye recipients
- DTO no incluye metadata interna
```

---

## 15.2. `GET /api/v1/me/communications/{communicationId}`

### Casos

```text id="hhxmlw"
- 200 obtiene comunicado accesible
- 404 comunicado ajeno
- 404 comunicado de otro tenant
- 404 comunicado draft
- DTO minimizado
```

---

## 15.3. `POST /mark-read`

### Casos

```text id="eow50e"
- 200 marca como leído
- repeated request devuelve mismo readAt o no duplica
- 404/403 si comunicado ajeno
- 404 si comunicado no publicado
- audit communication.read
```

---

# 16. API tests — Public Announcements WordPress

## 16.1. `GET /api/v1/public/tenants/{slug}/announcements`

### Casos visibles

```text id="ofcsmg"
- tenant activo + communication published + visibility public + isPublicVisible true
```

### Casos no visibles

```text id="epjuqa"
- tenant inexistente
- tenant suspended
- communication draft
- communication scheduled
- communication internal
- communication private
- communication tenant visibility
- communication public con isPublicVisible=false
- communication expired
- communication archived
- communication tenant B con slug A
```

### DTO público

Debe incluir:

```text id="wrk1c8"
publicId
slug
title
summary
body
category
priority
coverImageUrl
publishedAt
expiresAt
tenantSlug
```

No debe incluir:

```text id="kcndnd"
id interno
tenantId interno
recipients
userIds
personIds
propertyUnitIds
roleIds
readReceipts
notifications
deliveryAttempts
preferences
metadata interna
audit data
```

---

## 16.2. `GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}`

### Casos

```text id="x4x7jw"
- 200 comunicado público válido
- 404 comunicado privado
- 404 comunicado interno
- 404 comunicado tenant visibility
- 404 comunicado draft
- 404 comunicado expired
- 404 tenant suspendido
- 404 slug inexistente
```

---

## 16.3. Cache headers públicos

### Casos

```text id="uk2ga1"
- incluye Cache-Control: public, max-age=300
- incluye ETag si implementado
- incluye Last-Modified si implementado
- soporta 304 con If-None-Match si implementado
```

---

# 17. API tests — Notification Templates

## 17.1. `GET /notification-templates`

### Casos

```text id="smsi8t"
- 401 sin token
- 403 sin permiso
- 200 lista plantillas tenant
- incluye plantillas globales si política lo permite
- no lista plantillas tenant B
- filtros por status/category/channel/isSystem
```

---

## 17.2. `POST /notification-templates`

### Casos

```text id="yga15x"
- 201 crea template inApp
- 201 crea template email con subjectTemplate
- 422 email sin subjectTemplate
- 409 code/channel duplicado
- 422 variablesSchema inválido
- 422 variable usada no declarada
- 422 tenantId en body
- audit notificationTemplate.created
```

---

## 17.3. `PATCH /notification-templates/{templateId}`

### Casos

```text id="hqqupq"
- 200 actualiza template tenant
- 403/404 template tenant B
- 409/403 intenta editar isSystem sin permiso elevado
- 422 variables inválidas
- audit notificationTemplate.updated
```

---

## 17.4. Activar, desactivar y archivar

### Endpoints

```text id="iui1eb"
POST /activate
POST /deactivate
POST /archive
```

### Casos

```text id="gbwuh9"
- activa inactive
- desactiva active
- archiva active
- no usa archived para nuevas notificaciones
- audit notificationTemplate.activated
- audit notificationTemplate.deactivated
- audit notificationTemplate.archived
```

---

# 18. API tests — Notifications administrativas

## 18.1. `GET /api/v1/tenant/notifications`

### Casos

```text id="tut27y"
- 401 sin token
- 403 sin permiso notifications.read
- 200 con permiso
- filtra por recipientUserId
- filtra por sourceType
- filtra por sourceId
- filtra por category
- filtra por channel
- filtra por status
- no lista tenant B
```

---

## 18.2. `POST /api/v1/tenant/notifications`

### Casos

```text id="k28pdg"
- 201 crea notificación inApp
- 201 crea notificación email si provider noop/configurado
- 403 recipientUserId tenant B
- 403 propertyUnitId tenant B
- 422 canal inválido
- 422 template inactive
- 422 template variables invalid
- 409 o 200 existente para idempotencyKey repetida
- audit notification.created
```

---

## 18.3. `GET /api/v1/tenant/notifications/{notificationId}`

### Casos

```text id="ru0ukm"
- 200 admin obtiene notificación del tenant
- 404 inexistente
- 404/403 tenant B
```

---

## 18.4. `POST /send`

### Casos

```text id="c5ev83"
- inApp delivered
- email sent con provider mock
- email failed con provider mock fallido
- email skipped si provider no configurado
- preference disabled bloquea informational email
- mandatory/security ignora opt-out si política lo permite
- delivery attempt creado
- destinationMasked guardado
- audit notification.sent o notification.failed
```

---

## 18.5. `POST /retry`

### Casos

```text id="dd6csz"
- retry crea nuevo attempt
- attemptNumber incrementa
- no duplica Notification
- maxAttempts = 3
- falla si maxAttempts excedido
- audit notification.retryScheduled
```

---

## 18.6. `POST /cancel`

### Casos

```text id="n82xdx"
- cancela pending
- cancela failed si política lo permite
- no cancela read si política lo bloquea
- reason opcional u obligatorio según política
- audit notification.cancelled
```

---

## 18.7. Delivery attempts

### Endpoint

```text id="hm2uh9"
GET /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

### Casos

```text id="g1r771"
- requiere notifications.readDeliveryAttempts
- lista attempts de notification del tenant
- no lista tenant B
- destinationMasked presente
- no destination completo
- no provider credentials
- no raw provider response
```

---

# 19. API tests — Notifications propias `/me`

## 19.1. `GET /api/v1/me/notifications`

### Casos

```text id="unxm5v"
- 401 sin token
- 403 sin permiso notifications.read.own
- 200 lista propias
- no lista notificaciones de otro usuario
- no lista tenant B
- unreadOnly funciona
- filtros funcionan
- DTO no incluye recipientUserId
- DTO no incluye metadata interna
- DTO no incluye deliveryAttempts
```

---

## 19.2. `GET /api/v1/me/notifications/{notificationId}`

### Casos

```text id="snvt52"
- 200 obtiene propia
- 404/403 obtiene ajena
- 404 tenant B
- DTO minimizado
```

---

## 19.3. `POST /mark-read`

### Casos

```text id="rxfshf"
- 200 marca propia
- repeated mark-read idempotente
- 404/403 notificación ajena
- 404 tenant B
- audit notification.read
```

---

## 19.4. `POST /mark-all-read`

### Casos

```text id="metyjn"
- marca todas las propias
- filtra por category si se envía
- filtra por channel si se envía
- no modifica notificaciones de otro usuario
- no modifica tenant B
- idempotente
```

---

# 20. API tests — Notification Preferences `/me`

## 20.1. `GET /api/v1/me/notification-preferences`

### Casos

```text id="rsmxvc"
- 401 sin token
- 403 sin permiso
- 200 lista preferencias propias
- no lista preferencias de otro usuario
- no lista tenant B
```

---

## 20.2. `PUT /api/v1/me/notification-preferences`

### Casos

```text id="j5pbui"
- reemplaza preferencias propias
- crea nuevas si no existen
- actualiza existentes
- no permite userId en body
- no permite tenantId en body
- bloquea mandatory/security disabled si política lo impide
- audit notificationPreference.updated
```

---

## 20.3. `PATCH /api/v1/me/notification-preferences/{preferenceId}`

### Casos

```text id="i7hnxt"
- actualiza propia
- 404/403 preferencia ajena
- 404 tenant B
- bloquea mandatory/security disabled si política lo impide
```

---

# 21. Authorization tests

## 21.1. Sin autenticación

Probar 401 para:

```text id="f6ljxu"
GET /api/v1/tenant/communications
POST /api/v1/tenant/communications
GET /api/v1/me/communications
GET /api/v1/tenant/notification-templates
POST /api/v1/tenant/notifications
GET /api/v1/me/notifications
GET /api/v1/me/notification-preferences
```

---

## 21.2. Sin permisos administrativos

Probar 403 para usuario autenticado sin permisos:

```text id="ca4xl7"
communications.create
communications.publish
communications.manageAudience
notificationTemplates.create
notifications.create
notifications.send
notifications.retry
notifications.readDeliveryAttempts
```

---

## 21.3. Permisos propios

Probar:

```text id="rcva02"
- usuario con communications.read.own puede listar propios
- usuario sin communications.read.own recibe 403
- usuario con notifications.read.own puede listar propias
- usuario sin notifications.read.own recibe 403
- usuario con notificationPreferences.update.own actualiza propias
- usuario sin permiso recibe 403
```

---

## 21.4. Usuario deshabilitado

Probar:

```text id="gkq02s"
disabledUserA no puede consultar comunicaciones
disabledUserA no puede consultar notificaciones
disabledUserA no puede actualizar preferencias
```

---

# 22. Own-resource tests

## 22.1. Comunicados propios

Casos:

```text id="awpy08"
- ownerUserA ve comunicado allTenantUsers tenant A
- ownerUserA ve comunicado owners tenant A
- residentUserA ve comunicado residents tenant A
- residentUserA ve comunicado propertyUnitA101
- residentUserA no ve comunicado propertyUnitA102 si no tiene relación
- residentUserA no ve tenant B
```

---

## 22.2. Notificaciones propias

Casos:

```text id="wfd0c9"
- residentUserA ve notificationInAppResidentA
- residentUserA no ve notificationInAppOwnerA si no es destinatario
- residentUserA no ve notificationTenantB
- residentUserA no marca ajena como read
- mark-all-read solo modifica notificaciones de residentUserA
```

---

## 22.3. Preferencias propias

Casos:

```text id="etbpyo"
- usuario actualiza sus preferencias
- usuario no actualiza preferencia de otro usuario
- usuario no consulta preferencia de otro usuario
```

---

# 23. Multitenancy tests

## 23.1. Communications

```text id="unghi5"
- tenant A no lista communications tenant B
- tenant A no obtiene communicationId tenant B
- tenant A no actualiza communicationId tenant B
- tenant A no publica communicationId tenant B
- tenant A no archiva communicationId tenant B
```

---

## 23.2. Recipients

```text id="b9z40l"
- tenant A no usa userId tenant B
- tenant A no usa personId tenant B
- tenant A no usa propertyUnitId tenant B
- tenant A no usa roleId tenant B
- tenant A no lista recipients tenant B
```

---

## 23.3. Templates

```text id="lzxxfw"
- tenant A no lista templates tenant B
- tenant A no actualiza template tenant B
- tenant A puede usar template global si política lo permite
- tenant B no altera template tenant A
```

---

## 23.4. Notifications

```text id="jmj05a"
- tenant A no lista notifications tenant B
- tenant A no obtiene notificationId tenant B
- tenant A no envía notificationId tenant B
- tenant A no lista delivery attempts tenant B
- tenant A no crea notification para userId tenant B
```

---

## 23.5. Public WordPress

```text id="haqy9n"
- slug tenant A devuelve solo announcements tenant A
- slug tenant B devuelve solo announcements tenant B
- announcementSlug tenant B bajo slug A devuelve 404
```

---

# 24. Public safety tests

## 24.1. Comunicación pública válida

Debe aparecer si:

```text id="tipk47"
tenant.status = active
communication.status = published
communication.visibility = public
communication.isPublicVisible = true
communication.archivedAt IS NULL
communication.expiresAt IS NULL OR expiresAt > now()
```

---

## 24.2. Comunicación no pública

No debe aparecer si:

```text id="ayzrq4"
visibility = private
visibility = internal
visibility = tenant
isPublicVisible = false
status = draft
status = scheduled
status = cancelled
status = archived
status = expired
tenant.status != active
```

---

## 24.3. DTO público

Probar que no contiene:

```text id="ymadbe"
id interno
tenantId interno
createdBy
updatedBy
publishedBy
recipients
readReceipts
notifications
deliveryAttempts
preferences
metadata interna
audit data
datos financieros privados
datos de multas
evidencias
```

---

# 25. Notification delivery tests

## 25.1. In-app delivery

Casos:

```text id="o9zz2t"
- crea notification delivered
- visible en /me/notifications
- mark-read funciona
- no requiere provider
- no crea destino externo
```

---

## 25.2. Email delivery con provider mock

Casos:

```text id="a3bpnf"
- provider configured envía correctamente
- delivery attempt status sent/delivered
- providerMessageId sanitizado
- destinationMasked guardado
- email completo no guardado
```

---

## 25.3. Email delivery sin provider

Casos:

```text id="f5m2fr"
- registra skipped o failed
- no lanza error no controlado
- no rompe transacción principal
- audit notification.failed o deliveryAttempt.failed
```

---

## 25.4. Provider failure

Casos:

```text id="dqu8n3"
- error provider se sanitiza
- raw response no se guarda
- tokens no se guardan
- retry posible si attemptNumber < maxAttempts
```

---

## 25.5. Max attempts

Casos:

```text id="qmx5yr"
- primer retry attemptNumber 2
- segundo retry attemptNumber 3
- cuarto intento bloqueado
- error NOTIFICATION_MAX_ATTEMPTS_EXCEEDED
```

---

# 26. Idempotency tests

## 26.1. Comunicación publicada con notifyAudience

Casos:

```text id="mtntql"
- publish notifyAudience crea notificaciones una vez
- repetir publish no duplica notificaciones
- mismo sourceType/sourceId/user/channel no duplica
```

---

## 26.2. Notificación manual

Casos:

```text id="ubb6yf"
- Idempotency-Key repetida no duplica
- sin Idempotency-Key puede crear notificación manual nueva según política
- misma key con body distinto devuelve conflicto o recurso existente controlado
```

---

## 26.3. Eventos de dominio

Casos:

```text id="vct3ur"
- payment.confirmed repetido no duplica
- reservation.approved repetido no duplica
- fine.issued repetido no duplica
- accountStatement.published repetido no duplica
- canales distintos sí pueden crear notificaciones distintas
```

---

# 27. Template rendering tests

## 27.1. Variables válidas

```text id="v1bf0r"
template: "Su reserva de {{commonAreaName}} fue aprobada."
variables: { commonAreaName: "Salón comunal" }
resultado: "Su reserva de Salón comunal fue aprobada."
```

---

## 27.2. Variable faltante

Debe fallar:

```text id="l191jo"
bodyTemplate usa {{commonAreaName}}
variables no contiene commonAreaName
```

---

## 27.3. Variable no declarada

Debe fallar:

```text id="v5xgtl"
variablesSchema no declara unknownVariable
bodyTemplate usa {{unknownVariable}}
```

---

## 27.4. Sanitización

Debe bloquear:

```text id="v1f25s"
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<iframe src="..."></iframe>
javascript:
```

---

# 28. Preference policy tests

## 28.1. Informational opt-out

Casos:

```text id="wvvwdm"
- user desactiva informational email
- sistema no envía email informational
- inApp puede seguir habilitado si preferencia lo permite
```

---

## 28.2. Mandatory/security

Casos:

```text id="xb4cgm"
- user intenta desactivar security inApp
- sistema devuelve NOTIFICATION_MANDATORY_PREFERENCE_LOCKED
- mandatory notification se entrega aunque opt-out exista
```

---

## 28.3. Financial crítico

Casos:

```text id="lbyne3"
- policy marca financial como obligatorio
- usuario no puede bloquear canal obligatorio
- notificación financiera externa minimiza contenido
```

---

# 29. Security tests

## 29.1. No exposición pública de notificaciones

Probar que no existen:

```text id="nh9nlx"
GET /api/v1/public/tenants/{slug}/notifications
GET /api/v1/public/tenants/{slug}/notification-preferences
GET /api/v1/public/tenants/{slug}/notifications/{notificationId}
POST /api/v1/public/tenants/{slug}/notifications
```

Resultado esperado:

```text id="wgmt98"
404
```

---

## 29.2. No exposición de recipients

En endpoints públicos no debe aparecer:

```text id="t7bvsz"
recipients
userIds
personIds
propertyUnitIds
roleIds
```

---

## 29.3. No destinos completos

En delivery attempts no debe aparecer:

```text id="ckc4km"
email completo
teléfono completo
provider credentials
raw provider response completo
```

---

## 29.4. Safe errors

Errores no deben incluir:

```text id="hb6xol"
stack trace
SQL
Prisma error raw
token
cookie
authorization header
emails completos
teléfonos completos
body privado completo
provider raw response
```

---

## 29.5. Rate limiting

Casos:

```text id="l9umey"
- múltiples llamadas a endpoint público reciben 429 cuando exceden límite
- múltiples envíos manuales reciben 429 cuando exceden límite
- múltiples retries reciben 429 o bloqueo por maxAttempts
```

---

# 30. Audit integration tests

## 30.1. Comunicados

Verificar eventos:

```text id="ewymhx"
communication.created
communication.updated
communication.scheduled
communication.published
communication.cancelled
communication.archived
communication.audienceUpdated
communication.publicVisibilityChanged
communication.read
```

---

## 30.2. Plantillas

Verificar eventos:

```text id="axcxcl"
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
```

---

## 30.3. Notificaciones

Verificar eventos:

```text id="ut95gh"
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
```

---

## 30.4. Delivery attempts

Verificar eventos:

```text id="ore85p"
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
```

---

## 30.5. Preferencias

Verificar evento:

```text id="tcp2ih"
notificationPreference.updated
```

---

## 30.6. Metadata auditada

Permitido:

```text id="vyckz0"
communicationId
notificationId
templateId
recipientUserId
recipientType
category
channel
status
fromStatus
toStatus
sourceType
sourceId
traceId
```

Prohibido:

```text id="q10dsv"
payload completo
body completo privado
emails completos
teléfonos completos
tokens
secretos
provider credentials
provider raw response completo
datos financieros detallados
evidencias
comprobantes
```

---

# 31. Observability tests

## 31.1. Logs

Verificar logs para:

```text id="sm4je5"
communication.created
communication.updated
communication.published
communication.archived
communication.publicVisibilityChanged
communication.audienceUpdated
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.retryScheduled
notificationDeliveryAttempt.failed
notificationPreference.updated
```

---

## 31.2. Logs no deben incluir

```text id="gor7ou"
Authorization header
cookies
tokens
secretos
email completo
teléfono completo
body privado completo
provider raw response completo
stack trace en producción
```

---

## 31.3. Métricas

Verificar incremento de:

```text id="fk8kmu"
communications_created_total
communications_published_total
communications_archived_total
communications_public_total
notifications_created_total
notifications_sent_total
notifications_delivered_total
notifications_failed_total
notifications_read_total
notification_delivery_attempts_total
notification_delivery_failures_total
```

---

## 31.4. Labels prohibidos

Verificar que métricas no usen:

```text id="s7t7l8"
tenantId
communicationId
notificationId
userId
personId
propertyUnitId
email
phone
traceId
```

---

# 32. OpenAPI tests

## 32.1. Tags requeridos

```text id="zpkiz3"
Communications
My Communications
Public Announcements
Notification Templates
Notifications
My Notifications
Notification Preferences
```

---

## 32.2. Endpoints requeridos

OpenAPI debe documentar:

```text id="f5mejk"
GET /api/v1/tenant/communications
POST /api/v1/tenant/communications
GET /api/v1/tenant/communications/{communicationId}
PATCH /api/v1/tenant/communications/{communicationId}
POST /api/v1/tenant/communications/{communicationId}/publish
POST /api/v1/tenant/communications/{communicationId}/schedule
POST /api/v1/tenant/communications/{communicationId}/cancel
POST /api/v1/tenant/communications/{communicationId}/archive
GET /api/v1/tenant/communications/{communicationId}/recipients
PUT /api/v1/tenant/communications/{communicationId}/recipients
GET /api/v1/tenant/communications/{communicationId}/read-receipts
GET /api/v1/me/communications
GET /api/v1/me/communications/{communicationId}
POST /api/v1/me/communications/{communicationId}/mark-read
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
GET /api/v1/tenant/notification-templates
POST /api/v1/tenant/notification-templates
GET /api/v1/tenant/notification-templates/{templateId}
PATCH /api/v1/tenant/notification-templates/{templateId}
POST /api/v1/tenant/notification-templates/{templateId}/activate
POST /api/v1/tenant/notification-templates/{templateId}/deactivate
POST /api/v1/tenant/notification-templates/{templateId}/archive
GET /api/v1/tenant/notifications
POST /api/v1/tenant/notifications
GET /api/v1/tenant/notifications/{notificationId}
POST /api/v1/tenant/notifications/{notificationId}/send
POST /api/v1/tenant/notifications/{notificationId}/retry
POST /api/v1/tenant/notifications/{notificationId}/cancel
GET /api/v1/tenant/notifications/{notificationId}/delivery-attempts
GET /api/v1/me/notifications
GET /api/v1/me/notifications/{notificationId}
POST /api/v1/me/notifications/{notificationId}/mark-read
POST /api/v1/me/notifications/mark-all-read
GET /api/v1/me/notification-preferences
PUT /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

---

## 32.3. Endpoints prohibidos

OpenAPI no debe documentar:

```text id="ql6pwu"
GET /api/v1/public/tenants/{slug}/notifications
GET /api/v1/public/tenants/{slug}/notification-preferences
GET /api/v1/public/tenants/{slug}/communications/{id}/recipients
GET /api/v1/public/tenants/{slug}/communications/{id}/read-receipts
GET /api/v1/public/tenants/{slug}/notifications/{id}/delivery-attempts
POST /api/v1/public/tenants/{slug}/notifications
POST /api/v1/public/tenants/{slug}/communications/{id}/mark-read
```

---

## 32.4. DTOs OpenAPI

Debe documentar:

```text id="nwxpb6"
CreateCommunicationDto
UpdateCommunicationDto
CommunicationAdminDto
CommunicationListItemDto
CommunicationRecipientDto
UpdateCommunicationRecipientsDto
CommunicationReadReceiptDto
OwnCommunicationDto
PublicAnnouncementDto
CreateNotificationTemplateDto
UpdateNotificationTemplateDto
NotificationTemplateDto
CreateNotificationDto
NotificationAdminDto
NotificationDeliveryAttemptDto
OwnNotificationDto
NotificationPreferenceDto
UpdateNotificationPreferencesDto
```

---

# 33. Performance tests

## 33.1. Objetivos MVP

```text id="n0s1zs"
p95 < 700 ms para listados paginados de comunicados con filtros comunes.
p95 < 700 ms para listados paginados de notificaciones propias.
p95 < 700 ms para endpoints públicos de announcements con pageSize <= 50.
```

---

## 33.2. Escenarios

```text id="y190ed"
- 1 tenant con 1.000 comunicados
- 1 tenant con 10.000 notificaciones
- 1 usuario con 1.000 notificaciones
- listado público con 200 comunicados publicados
- filtros por status/category/channel
```

---

## 33.3. Criterios

* No N+1 en listados.
* No cargar recipients en listados administrativos por defecto.
* No cargar delivery attempts en listados de notificaciones por defecto.
* Paginación obligatoria.
* `pageSize` máximo 100 en endpoints privados.
* `pageSize` máximo 50 en endpoints públicos.

---

# 34. Smoke tests

## 34.1. Flujo mínimo de comunicaciones

```text id="uoirgh"
1. Crear comunicado draft.
2. Reemplazar audiencia con allTenantUsers.
3. Publicar comunicado.
4. Consultar comunicado desde /me.
5. Marcar comunicado como leído.
6. Consultar read receipt administrativo.
```

Resultado esperado:

```text id="hjpihh"
- comunicado publicado
- visible para usuario autorizado
- read receipt creado
- auditoría generada
```

---

## 34.2. Flujo público WordPress

```text id="ejqp6u"
1. Crear comunicado public.
2. Publicar con isPublicVisible=true.
3. Consultar /api/v1/public/tenants/{slug}/announcements.
4. Consultar detalle público.
```

Resultado esperado:

```text id="co80yv"
- aparece públicamente
- DTO public-safe
- no recipients
- no metadata interna
```

---

## 34.3. Flujo de notificación in-app

```text id="ybtvja"
1. Crear plantilla RESERVATION_APPROVED inApp.
2. Crear notificación para residentUserA.
3. Consultar /me/notifications.
4. Marcar notificación como leída.
```

Resultado esperado:

```text id="xb3a6w"
- notificación delivered
- visible solo para residentUserA
- readAt establecido
- auditoría generada
```

---

## 34.4. Flujo de email mock/noop

```text id="j1z8fd"
1. Crear notificación email.
2. Ejecutar send.
3. Registrar delivery attempt.
4. Simular provider failed o skipped.
```

Resultado esperado:

```text id="wn7igd"
- no rompe transacción principal
- attempt registrado
- destinationMasked
- error sanitizado
```

---

# 35. CI/CD gates

## 35.1. Comandos mínimos

```bash id="frsluk"
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

## 35.2. Comandos específicos sugeridos

```bash id="ol4jqz"
npm run test:communications
npm run test:communications:unit
npm run test:communications:application
npm run test:communications:integration
npm run test:communications:api
npm run test:communications:authorization
npm run test:communications:own-resource
npm run test:communications:multitenancy
npm run test:communications:public
npm run test:communications:notifications
npm run test:communications:delivery
npm run test:communications:preferences
npm run test:communications:security
npm run test:communications:audit
npm run test:communications:openapi
```

---

## 35.3. Gates obligatorios

El pipeline debe fallar si:

```text id="oo8r4t"
- existe comunicación cross-tenant.
- existe notificación cross-tenant.
- usuario puede leer notificación ajena.
- usuario puede marcar notificación ajena como leída.
- comunicado privado aparece en endpoint público.
- endpoint público devuelve recipients.
- endpoint público devuelve metadata interna.
- se documentan endpoints públicos de notifications.
- se guarda email completo en delivery attempt.
- se guarda teléfono completo en delivery attempt.
- se guarda provider raw response completo.
- se duplica notificación por idempotencyKey.
- se omite tenant_id en consulta crítica.
- OpenAPI no coincide con api-contract.
- logs contienen tokens o secretos en tests de observabilidad.
- build falla.
```

---

# 36. Criterios de aceptación globales del plan de pruebas

El módulo se considera probado cuando:

```text id="jvkzpp"
[ ] Unit tests pasan.
[ ] DTO validation tests pasan.
[ ] Entity tests pasan.
[ ] Application service tests pasan.
[ ] Use case tests pasan.
[ ] Repository integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Audience tests pasan.
[ ] Public WordPress tests pasan.
[ ] Notification delivery tests pasan.
[ ] Notification preference tests pasan.
[ ] Notification idempotency tests pasan.
[ ] Template rendering tests pasan.
[ ] Destination masking tests pasan.
[ ] Audit integration tests pasan.
[ ] Observability tests pasan.
[ ] Security tests pasan.
[ ] OpenAPI tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
```

---

# 37. Matriz de riesgos y pruebas asociadas

| Riesgo                            | Pruebas requeridas                     |
| --------------------------------- | -------------------------------------- |
| Comunicación cross-tenant         | Multitenancy tests, API tests          |
| Notificación cross-tenant         | Multitenancy tests, own-resource tests |
| Usuario ve notificación ajena     | Own-resource tests                     |
| Comunicado privado público        | Public safety tests                    |
| WordPress recibe metadata interna | Public DTO tests                       |
| Destinatario de otro tenant       | Audience tests                         |
| Plantilla insegura                | Template rendering tests               |
| Inyección de HTML/script          | Sanitization tests                     |
| Duplicidad masiva                 | Idempotency tests                      |
| Provider externo caído            | Delivery tests                         |
| Email completo persistido         | Destination masking tests              |
| Preferencia mal aplicada          | Preference policy tests                |
| Mandatory bloqueado               | Preference policy tests                |
| Logs con secretos                 | Observability tests                    |
| Auditoría incompleta              | Audit integration tests                |
| OpenAPI expone endpoint prohibido | OpenAPI tests                          |

---

# 38. Casos no aceptables

No se aceptará la implementación si ocurre cualquiera de los siguientes casos:

```text id="qcq57l"
- Tenant A puede consultar comunicaciones de Tenant B.
- Tenant A puede crear recipients usando usuarios de Tenant B.
- Tenant A puede crear recipients usando unidades de Tenant B.
- Usuario puede leer comunicación no dirigida a él.
- Usuario puede leer notificación ajena.
- Usuario puede marcar como leída una notificación ajena.
- WordPress puede consultar comunicados privados.
- WordPress puede consultar notificaciones.
- Endpoint público expone recipients.
- Endpoint público expone metadata interna.
- Delivery attempt guarda email completo.
- Delivery attempt guarda teléfono completo.
- Delivery attempt guarda provider credentials.
- Provider raw response se guarda completo.
- Plantilla permite script injection.
- Notificación duplicada se crea con la misma idempotencyKey.
- Preferencias permiten bloquear mandatory/security sin política explícita.
- Logs contienen tokens, secretos o body privado completo.
- Auditoría no registra publicación, envío o fallo relevante.
- OpenAPI documenta rutas públicas prohibidas.
```

---

# 39. Resultado esperado

Al completar este plan de pruebas, el módulo `012-communications-notifications` debe quedar validado como un componente:

```text id="z0jo83"
tenant-scoped
permissioned
audience-aware
own-resource protected
public-safe
privacy-preserving
channel-aware
idempotent
delivery-traceable
auditable
observable
OpenAPI-consistent
CI-enforced
```

El resultado probado debe incluir:

```text id="o50tgw"
- gestión administrativa de comunicados;
- gestión de audiencia;
- publicación, programación, cancelación y archivo;
- consulta de comunicados propios;
- lectura idempotente de comunicados;
- endpoints públicos seguros para WordPress;
- gestión de plantillas de notificación;
- generación de notificaciones in-app;
- consulta de notificaciones propias;
- lectura idempotente de notificaciones;
- delivery attempts;
- email adapter mock/noop;
- destination masking;
- preferencias básicas;
- idempotencia por evento;
- auditoría;
- observabilidad segura;
- OpenAPI validado;
- CI passing.
```

---

## 40. Próximo documento

El siguiente documento recomendado para continuar el paquete de `012-communications-notifications` es:

```text id="vno19l"
docs/specs/012-communications-notifications/tasks.md
```
