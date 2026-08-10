# Spec 012 — Communications and Notifications

## 1. Información del documento

| Campo           | Valor                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                    |
| Spec ID         | 012                                                                                                                                                              |
| Módulo          | Communications and Notifications                                                                                                                                 |
| Documento       | Functional Specification                                                                                                                                         |
| Ruta            | `docs/specs/012-communications-notifications/spec.md`                                                                                                            |
| Versión         | 0.1                                                                                                                                                              |
| Estado          | needs-review                                                                                                                                                     |
| Fecha           | 2026-07-19                                                                                                                                                       |
| Prioridad       | Alta                                                                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `009-wordpress-integration-basic`                                                     |
| Relacionado con | Comunicados, avisos, notificaciones internas, email, WhatsApp futuro, preferencias, plantillas, auditoría, WordPress, pagos, multas, reservas, estados de cuenta |

---

## 2. Nombre de la funcionalidad

```text id="spypbm"
Communications and Notifications
```

---

## 3. Propósito

El módulo `012-communications-notifications` define la gestión de comunicados y notificaciones dentro de RESIDENT Core.

El objetivo es permitir que cada conjunto residencial pueda crear, publicar, segmentar, consultar y entregar comunicaciones administrativas a residentes, propietarios, usuarios internos y, cuando aplique, al portal público WordPress.

Este módulo debe soportar dos líneas funcionales principales:

```text id="m21jus"
1. Communications: comunicados, avisos y mensajes administrativos.
2. Notifications: notificaciones generadas por eventos del sistema o acciones administrativas.
```

Regla central:

```text id="qle2db"
Toda comunicación o notificación debe pertenecer a un tenant, tener audiencia controlada, contenido clasificado, trazabilidad auditable y reglas de entrega seguras según el canal.
```

---

## 4. Objetivo funcional

Permitir la administración inicial de comunicaciones y notificaciones en RESIDENT Core, incluyendo:

* creación de comunicados administrativos;
* publicación de comunicados internos;
* publicación opcional de comunicados públicos para WordPress;
* segmentación básica por audiencia;
* comunicación a todos los residentes;
* comunicación a propietarios;
* comunicación a residentes;
* comunicación por unidad habitacional;
* comunicación por rol;
* consulta de comunicados administrativos;
* consulta de comunicados propios;
* consulta pública de comunicados marcados como públicos;
* plantillas básicas de notificación;
* generación de notificaciones internas;
* registro de preferencias básicas de notificación;
* bandeja de notificaciones del usuario;
* marcado de notificaciones como leídas;
* registro de intentos de entrega;
* soporte inicial para notificación in-app;
* soporte opcional para email mediante adaptador;
* preparación para WhatsApp, SMS, push y n8n;
* auditoría de cambios, publicaciones y entregas críticas;
* protección de datos personales;
* no exposición pública de contenido privado.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="yf6hhx"
1. Gestión de comunicados administrativos.
2. Estados de comunicado.
3. Clasificación de visibilidad.
4. Audiencias básicas.
5. Publicación interna.
6. Publicación pública opcional para WordPress.
7. Consulta administrativa de comunicados.
8. Consulta propia de comunicados.
9. Consulta pública de comunicados publicables.
10. Plantillas básicas de notificación.
11. Notificaciones in-app.
12. Registro de notificaciones por usuario.
13. Marcado de notificaciones como leídas.
14. Preferencias básicas de notificación.
15. Registro de intentos de entrega.
16. Canal email mediante puerto/adaptador.
17. Preparación para canales futuros.
18. Integración con eventos de otros módulos.
19. Auditoría de operaciones críticas.
20. API REST.
21. Pruebas funcionales, multitenant, autorización, privacidad y seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="tmbvze"
- WhatsApp real en producción.
- SMS real en producción.
- Push notifications móviles.
- Campañas masivas avanzadas.
- Marketing automation.
- Segmentación avanzada por comportamiento.
- Constructor visual de plantillas.
- Editor WYSIWYG avanzado.
- Adjuntos complejos.
- Boletines con diseño avanzado.
- Confirmación legal de recepción certificada.
- Firma electrónica de comunicados.
- Chat bidireccional.
- Foros comunitarios.
- Comentarios públicos.
- Encuestas.
- Votaciones.
- Reuniones/asambleas.
- n8n workflows avanzados.
- Automatizaciones complejas por reglas.
- IA para redacción automática con datos reales.
- Traducción automática.
- Análisis de sentimiento.
- Notificaciones transaccionales críticas con proveedor externo obligatorio.
- Webhooks salientes avanzados.
- Cola distribuida multi-región.
- Centro de preferencias avanzado.
```

Estos temas podrán definirse en specs futuras.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="gb34ny"
Communications and Notifications
```

Se relaciona con:

```text id="sz3g41"
Tenant Management
Identity and Access
Residents and Properties
Financial Management
Payments and Reconciliation
Reservations and Rentals
Fines and Sanctions
Meetings and Attendance
Audit and Compliance
External Integrations
Reporting and Analytics
```

Relación conceptual:

```text id="d2phwd"
Tenant
  └── Communication Channels
  └── Notification Templates
  └── Communications
        ├── Audience
        ├── Recipients
        ├── Visibility
        ├── Publication
        └── Audit Trail
  └── Notifications
        ├── User Recipient
        ├── Channel
        ├── Delivery Status
        ├── Read Status
        └── Delivery Attempts
```

---

## 7. Principios

### 7.1. Tenant isolation obligatorio

Toda comunicación, plantilla, notificación, preferencia, destinatario e intento de entrega pertenece a un tenant.

Regla:

```text id="rpjl4t"
communication.tenantId == notification.tenantId == currentTenant.id
```

---

### 7.2. Comunicación no reemplaza módulos de dominio

Este módulo no debe modificar directamente cargos, pagos, multas, reservas o estados de cuenta.

Regla:

```text id="y30xu5"
Communications and Notifications informa eventos; no ejecuta decisiones financieras, sancionatorias ni operativas.
```

---

### 7.3. Contenido clasificado por visibilidad

Toda comunicación debe indicar su visibilidad.

Tipos básicos:

```text id="k166eh"
private
internal
tenant
public
```

Significado:

* `private`: solo destinatarios explícitos.
* `internal`: usuarios administrativos del tenant.
* `tenant`: usuarios autenticados del tenant según audiencia.
* `public`: puede exponerse públicamente si está publicada y marcada como publicable.

---

### 7.4. WordPress solo consume contenido público

El portal WordPress solo puede consumir comunicados con:

```text id="u4etep"
visibility = public
status = published
isPublicVisible = true
```

WordPress no debe consumir notificaciones privadas ni bandejas de usuario.

---

### 7.5. Notificación in-app como canal base

El canal base del MVP será:

```text id="f3gfs7"
inApp
```

Esto permite entregar notificaciones dentro del futuro portal transaccional/residente sin depender inicialmente de proveedores externos.

---

### 7.6. Email mediante adaptador

El email puede estar soportado mediante puerto/adaptador si la configuración del tenant o de plataforma está disponible.

Regla:

```text id="rgzlfs"
El módulo solicita envío por email a través de un puerto; no acopla lógica de negocio al proveedor.
```

---

### 7.7. WhatsApp y SMS diferidos

WhatsApp y SMS quedan preparados como canales futuros, pero no obligatorios en MVP.

---

### 7.8. Preferencias y consentimiento

El sistema debe respetar preferencias básicas de usuario cuando aplique.

Sin embargo, algunas notificaciones pueden ser obligatorias por naturaleza administrativa o financiera.

Categorías:

```text id="dk5laj"
mandatory
administrative
financial
security
operational
informational
marketing
```

MVP no usará `marketing`.

---

### 7.9. Auditoría obligatoria

Se deben auditar operaciones críticas:

* creación de comunicado;
* publicación;
* archivo;
* cambio de visibilidad;
* cambio de audiencia;
* envío manual;
* creación de plantilla;
* actualización de plantilla;
* generación de notificación crítica;
* fallo masivo de entrega;
* descarga o acceso a contenido privado si aplica.

---

### 7.10. Minimización de datos

Las notificaciones no deben contener más datos personales o financieros de los necesarios.

Ejemplo:

```text id="d0un73"
Correcto: Tiene un nuevo estado de cuenta disponible.
Incorrecto: Su saldo vencido exacto, desglose completo y datos personales en un canal no seguro.
```

---

## 8. Actores

### 8.1. TenantAdmin

Administrador del conjunto.

Puede:

* crear comunicados;
* editar comunicados;
* publicar comunicados;
* archivar comunicados;
* configurar visibilidad;
* definir audiencia;
* consultar historial;
* consultar resultados de entrega;
* administrar plantillas básicas.

---

### 8.2. CommunicationManager

Rol operativo para gestionar comunicación comunitaria.

Puede:

* crear comunicados;
* preparar borradores;
* programar publicación si se habilita;
* publicar según permiso;
* consultar estadísticas básicas;
* gestionar plantillas si tiene permiso.

---

### 8.3. Treasurer

Responsable financiero.

Puede generar o revisar comunicaciones relacionadas con:

* pagos;
* alícuotas;
* estados de cuenta;
* recordatorios financieros;
* vencimientos.

No debe enviar comunicaciones masivas financieras sin permisos explícitos.

---

### 8.4. SanctionManager

Responsable de multas y sanciones.

Puede generar comunicaciones o notificaciones relacionadas con:

* multas emitidas;
* reclamos;
* resoluciones;
* evidencias disponibles.

Debe respetar privacidad de `011-fines-sanctions`.

---

### 8.5. ReservationManager

Responsable de áreas comunales.

Puede generar notificaciones relacionadas con:

* reservas solicitadas;
* aprobaciones;
* rechazos;
* cancelaciones;
* cambios de disponibilidad.

---

### 8.6. PropertyOwner

Propietario asociado a una o más unidades.

Puede:

* consultar comunicados dirigidos a sus unidades;
* consultar notificaciones propias;
* marcar notificaciones como leídas;
* configurar preferencias básicas si aplica.

---

### 8.7. Resident

Residente asociado a una unidad.

Puede:

* consultar comunicados dirigidos a residentes;
* consultar notificaciones propias;
* marcar notificaciones como leídas;
* configurar preferencias básicas si aplica.

---

### 8.8. PlatformAdmin

Administrador de plataforma.

Puede:

* apoyar soporte técnico;
* consultar configuración técnica limitada;
* no debe leer comunicaciones privadas ordinarias de tenants salvo soporte excepcional y auditado.

---

### 8.9. Visitante público

Usuario no autenticado desde WordPress.

Puede:

* consultar comunicados públicos;
* consultar información pública mínima del tenant.

No puede:

* consultar comunicados internos;
* consultar notificaciones;
* consultar destinatarios;
* consultar preferencias;
* consultar intentos de entrega.

---

## 9. Definiciones

### 9.1. Communication

Comunicado administrativo creado por un tenant.

Puede ser:

```text id="t15t9k"
aviso general
comunicado interno
comunicado público
noticia comunitaria
recordatorio administrativo
anuncio operativo
```

---

### 9.2. Notification

Mensaje generado para un usuario específico o grupo de usuarios como resultado de una acción administrativa o evento del sistema.

Ejemplos:

```text id="z2lnqr"
Su pago fue confirmado.
Su reserva fue aprobada.
Tiene una nueva multa emitida.
Tiene un nuevo comunicado.
Su estado de cuenta está disponible.
```

---

### 9.3. Notification Template

Plantilla reusable para construir notificaciones consistentes.

---

### 9.4. Communication Recipient

Destinatario o segmento objetivo de una comunicación.

Puede ser:

```text id="uh0ako"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
```

---

### 9.5. Delivery Attempt

Intento de entrega de una notificación a través de un canal.

Ejemplos de canales:

```text id="qvd1qz"
inApp
email
whatsapp
sms
push
webhook
```

MVP obligatorio:

```text id="i8azoy"
inApp
```

MVP opcional:

```text id="ocszwh"
email
```

---

### 9.6. Notification Preference

Preferencia básica de usuario para recibir notificaciones según canal y categoría.

---

### 9.7. Public Communication

Comunicado marcado como público, publicado y autorizado para consumo por WordPress.

---

## 10. Supuestos

1. El tenant ya existe.
2. Usuarios, roles y permisos ya existen.
3. Residentes, propietarios, personas y unidades ya existen.
4. WordPress ya puede consumir endpoints públicos definidos en `009-wordpress-integration-basic`.
5. El módulo de auditoría existe.
6. La autenticación se resuelve vía Keycloak o mecanismo compatible.
7. RESIDENT Core autoriza por tenant, permiso y recurso.
8. El canal in-app estará disponible en MVP.
9. El canal email puede implementarse mediante adaptador si la plataforma lo habilita.
10. WhatsApp, SMS y push se preparan, pero no son obligatorios en MVP.
11. Los comunicados públicos no contienen datos personales ni financieros privados.
12. Las notificaciones privadas no se exponen públicamente.
13. Las fechas se almacenan en UTC.
14. La zona horaria por defecto para presentación es `America/Guayaquil`.
15. El sistema no enviará datos reales a IA externa.
16. El sistema no usará contenido privado para entrenamiento ni automatización sin autorización explícita.

---

## 11. Entidades principales

### 11.1. Communication

Representa un comunicado o aviso creado por un tenant.

Campos conceptuales:

```text id="pb340v"
Communication
├── id
├── tenantId
├── title
├── slug
├── summary
├── body
├── category
├── visibility
├── status
├── priority
├── audienceType
├── isPublicVisible
├── publishAt
├── publishedAt
├── expiresAt
├── createdBy
├── updatedBy
├── publishedBy
├── archivedBy
├── coverImageUrl
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.2. CommunicationRecipient

Representa destinatarios explícitos o segmentos de una comunicación.

Campos conceptuales:

```text id="mbxuzk"
CommunicationRecipient
├── id
├── tenantId
├── communicationId
├── recipientType
├── userId nullable
├── propertyUnitId nullable
├── roleId nullable
├── personId nullable
├── createdAt
└── archivedAt
```

---

### 11.3. NotificationTemplate

Representa plantilla reusable para notificaciones.

Campos conceptuales:

```text id="jd0r51"
NotificationTemplate
├── id
├── tenantId nullable
├── code
├── name
├── description
├── category
├── channel
├── subjectTemplate
├── bodyTemplate
├── variablesSchema
├── status
├── isSystem
├── createdAt
├── updatedAt
└── archivedAt
```

Nota:

```text id="vij5jy"
tenantId nullable permite plantillas de plataforma. Las plantillas específicas de tenant deben tener tenantId.
```

---

### 11.4. Notification

Representa una notificación generada para un usuario.

Campos conceptuales:

```text id="kezzsh"
Notification
├── id
├── tenantId
├── recipientUserId
├── recipientPersonId nullable
├── propertyUnitId nullable
├── templateId nullable
├── sourceType
├── sourceId nullable
├── category
├── channel
├── title
├── body
├── status
├── priority
├── readAt nullable
├── actionUrl nullable
├── metadata nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.5. NotificationDeliveryAttempt

Representa intento de entrega por canal.

Campos conceptuales:

```text id="np53u9"
NotificationDeliveryAttempt
├── id
├── tenantId
├── notificationId
├── channel
├── provider
├── destinationMasked
├── status
├── attemptNumber
├── providerMessageId nullable
├── errorCode nullable
├── errorMessage nullable
├── attemptedAt
├── deliveredAt nullable
├── failedAt nullable
└── metadata nullable
```

---

### 11.6. NotificationPreference

Representa preferencias básicas de notificación del usuario.

Campos conceptuales:

```text id="ioex70"
NotificationPreference
├── id
├── tenantId
├── userId
├── category
├── channel
├── isEnabled
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.7. CommunicationReadReceipt

Representa lectura o confirmación básica de un comunicado por usuario.

Campos conceptuales:

```text id="zm3dm9"
CommunicationReadReceipt
├── id
├── tenantId
├── communicationId
├── userId
├── readAt
├── createdAt
└── archivedAt
```

MVP:

```text id="b1z54w"
Lectura simple. No equivale a notificación legal certificada.
```

---

## 12. Estados y enums

### 12.1. CommunicationStatus

```text id="wa8k9i"
draft
scheduled
published
expired
archived
cancelled
```

---

### 12.2. CommunicationVisibility

```text id="tc2p1w"
private
internal
tenant
public
```

---

### 12.3. CommunicationCategory

```text id="essnki"
general
administrative
financial
maintenance
security
community
reservation
fine
meeting
emergency
other
```

---

### 12.4. CommunicationPriority

```text id="zxapmx"
low
normal
high
urgent
```

---

### 12.5. AudienceType

```text id="mie6em"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

### 12.6. CommunicationRecipientType

```text id="pxi3pu"
user
person
propertyUnit
role
owner
resident
allTenantUsers
```

---

### 12.7. NotificationStatus

```text id="e0gqmt"
pending
sent
delivered
failed
read
archived
cancelled
```

---

### 12.8. NotificationChannel

```text id="ohijuy"
inApp
email
whatsapp
sms
push
webhook
```

MVP obligatorio:

```text id="re1ylw"
inApp
```

MVP opcional:

```text id="tkkt68"
email
```

Diferidos:

```text id="izbejc"
whatsapp
sms
push
webhook
```

---

### 12.9. NotificationCategory

```text id="pmjf8r"
mandatory
administrative
financial
security
operational
reservation
fine
meeting
informational
system
```

---

### 12.10. NotificationPriority

```text id="gvftha"
low
normal
high
urgent
```

---

### 12.11. NotificationTemplateStatus

```text id="xnvpop"
active
inactive
archived
```

---

### 12.12. DeliveryAttemptStatus

```text id="c8y3bi"
pending
sent
delivered
failed
cancelled
skipped
```

---

## 13. Transiciones de estado

### 13.1. Communication

Flujo básico:

```text id="jainpa"
draft -> published
```

Flujo programado:

```text id="ciqawi"
draft -> scheduled -> published
```

Expiración:

```text id="zrnkn1"
published -> expired
```

Cancelación:

```text id="u3ggqa"
draft -> cancelled
scheduled -> cancelled
```

Archivo:

```text id="lrz7of"
published -> archived
expired -> archived
cancelled -> archived
```

Transiciones prohibidas:

```text id="c4ouko"
archived -> published
cancelled -> published
expired -> draft
published -> draft
```

---

### 13.2. Notification

Flujo in-app:

```text id="n2qba9"
pending -> delivered -> read
```

Flujo email:

```text id="kicvs5"
pending -> sent -> delivered
pending -> sent -> failed
pending -> failed
```

Archivo:

```text id="u42d07"
delivered -> archived
read -> archived
failed -> archived
cancelled -> archived
```

Cancelación:

```text id="xw3cqx"
pending -> cancelled
```

---

### 13.3. Delivery Attempt

```text id="zvza9z"
pending -> sent -> delivered
pending -> sent -> failed
pending -> failed
pending -> skipped
pending -> cancelled
```

---

## 14. Reglas de negocio

### BR-001 — Toda comunicación pertenece a un tenant

```text id="mvrfy0"
communication.tenantId = currentTenant.id
```

---

### BR-002 — Toda notificación pertenece a un tenant

```text id="ixp23x"
notification.tenantId = currentTenant.id
```

---

### BR-003 — No aceptar tenantId desde body

El `tenantId` debe derivarse del tenant activo del usuario autenticado o del contexto del evento interno.

---

### BR-004 — Comunicados públicos requieren visibilidad pública explícita

Un comunicado solo puede exponerse públicamente si cumple:

```text id="oduaie"
status = published
visibility = public
isPublicVisible = true
```

---

### BR-005 — Comunicados internos no son públicos

Si `visibility != public`, no debe aparecer en endpoints públicos.

---

### BR-006 — Notificaciones privadas no son públicas

Ninguna notificación debe exponerse bajo `/api/v1/public`.

---

### BR-007 — Audiencia obligatoria

Todo comunicado no público debe definir audiencia.

---

### BR-008 — Público WordPress solo accede a campos seguros

El endpoint público no debe exponer:

```text id="yq0cdg"
recipients
userIds
personIds
propertyUnitIds
roleIds
readReceipts
deliveryAttempts
notification metadata
audit metadata
```

---

### BR-009 — In-app es canal base

Toda notificación generada para usuario autenticado debe poder registrarse como `inApp`.

---

### BR-010 — Email depende de configuración

El sistema solo debe intentar email si:

```text id="dbs4r0"
channel = email
AND email provider is configured
AND recipient has email
AND preference allows it or notification is mandatory
```

---

### BR-011 — Preferencias no bloquean notificaciones obligatorias

Las categorías `mandatory`, `security` y algunas `financial` pueden ignorar preferencias de opt-out según política del tenant.

---

### BR-012 — No enviar datos sensibles por canales inseguros

Canales externos no deben incluir detalles financieros o personales innecesarios.

Ejemplo correcto:

```text id="t6z7ks"
Tiene una nueva notificación en RESIDENT Core.
```

Ejemplo incorrecto:

```text id="ym65cu"
Su saldo exacto, multa detallada y datos de unidad enviados por canal externo sin protección.
```

---

### BR-013 — Plantillas activas solamente

Solo plantillas `active` pueden usarse para nuevas notificaciones.

---

### BR-014 — Variables de plantilla deben validarse

Las variables usadas para renderizar plantillas deben cumplir el schema definido.

---

### BR-015 — Fallo de canal no debe romper transacción principal

Si un evento de dominio genera una notificación y el envío externo falla, la transacción principal del dominio no debe revertirse, salvo notificación crítica explícitamente configurada.

---

### BR-016 — Delivery attempts deben registrarse

Todo intento de entrega por canal externo debe crear registro de intento.

---

### BR-017 — Reintentos controlados

Los reintentos deben tener límite.

MVP recomendado:

```text id="opyn5t"
maxAttempts = 3
```

---

### BR-018 — Mark as read solo por destinatario

Un usuario solo puede marcar como leídas sus propias notificaciones.

---

### BR-019 — Read receipts de comunicados solo por usuario destinatario

Un usuario solo puede registrar lectura de comunicados accesibles para él.

---

### BR-020 — No eliminación física ordinaria

No eliminar físicamente comunicados, notificaciones, plantillas, entregas o recibos de lectura en operación ordinaria.

---

### BR-021 — Auditoría de publicación

Toda publicación, archivo, cancelación o cambio de visibilidad debe auditarse.

---

### BR-022 — Auditoría de envío manual

Todo envío manual masivo debe auditarse.

---

### BR-023 — Rate limiting en envíos

El sistema debe evitar abuso de envíos masivos.

---

### BR-024 — No spam

El sistema debe prevenir notificaciones duplicadas por el mismo evento mediante idempotencia.

Idempotency key sugerida:

```text id="zjhdq3"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

---

### BR-025 — No exponer emails masivamente

Listados administrativos de destinatarios no deben exponer emails, teléfonos o destinos completos salvo permiso explícito.

---

### BR-026 — Destination masking

Los intentos de entrega deben guardar destinos enmascarados.

Ejemplos:

```text id="hcakck"
g***@example.com
+593*******123
```

---

### BR-027 — Comunicados financieros deben minimizar datos

Los comunicados o notificaciones de categoría `financial` no deben incluir saldos completos en canales públicos o no autenticados.

---

### BR-028 — Comunicados de multas deben respetar privacidad

Las notificaciones originadas por `011-fines-sanctions` no deben incluir evidencias, detalles sensibles o información de terceros.

---

### BR-029 — Comunicados de reservas deben respetar privacidad

Las notificaciones originadas por `010-reservations-common-areas` no deben revelar identidad de terceros ni reservas privadas.

---

### BR-030 — No usar IA externa con datos reales

El contenido privado no debe enviarse a herramientas externas de IA para redacción, resumen, clasificación o traducción sin anonimización y autorización específica.

---

## 15. Historias de usuario

### US-001 — Crear comunicado administrativo

Como CommunicationManager, quiero crear un comunicado para informar a los usuarios del conjunto.

#### Criterios de aceptación

* Requiere permiso.
* Requiere título.
* Requiere cuerpo.
* Requiere categoría.
* Requiere visibilidad.
* Requiere audiencia si no es público.
* Estado inicial `draft`.
* Registra auditoría.

---

### US-002 — Publicar comunicado

Como TenantAdmin, quiero publicar un comunicado para que sea visible a su audiencia.

#### Criterios de aceptación

* Requiere permiso.
* Comunicado en estado válido.
* Audiencia válida.
* Si es público, `visibility = public` e `isPublicVisible = true`.
* Registra `publishedAt`.
* Registra `publishedBy`.
* Audita publicación.

---

### US-003 — Consultar comunicados administrativos

Como administrador, quiero listar comunicados con filtros.

#### Criterios de aceptación

* Requiere permiso.
* Filtra por estado, categoría, visibilidad y fecha.
* Pagina resultados.
* No mezcla tenants.

---

### US-004 — Consultar comunicados propios

Como residente o propietario, quiero ver comunicados dirigidos a mí o a mis unidades.

#### Criterios de aceptación

* Requiere autenticación.
* Valida relación con tenant.
* Valida audiencia.
* No muestra comunicados ajenos.
* No muestra borradores.
* No muestra archivados salvo política.

---

### US-005 — Consultar comunicados públicos desde WordPress

Como visitante público, quiero ver comunicados públicos del conjunto.

#### Criterios de aceptación

* No requiere autenticación.
* Solo muestra `published`.
* Solo muestra `visibility = public`.
* Solo muestra `isPublicVisible = true`.
* No muestra destinatarios.
* No muestra datos internos.

---

### US-006 — Crear plantilla de notificación

Como TenantAdmin, quiero crear plantillas de notificación para estandarizar mensajes.

#### Criterios de aceptación

* Requiere permiso.
* Valida código único por tenant o plataforma.
* Valida canal.
* Valida subject/body.
* Valida variables permitidas.
* Audita creación.

---

### US-007 — Generar notificación in-app

Como sistema, quiero generar una notificación in-app cuando ocurre un evento relevante.

#### Criterios de aceptación

* Tiene tenant.
* Tiene destinatario.
* Tiene categoría.
* Tiene origen.
* Crea notificación.
* Evita duplicados por idempotencia.
* Audita si es crítica.

---

### US-008 — Consultar mis notificaciones

Como usuario, quiero consultar mi bandeja de notificaciones.

#### Criterios de aceptación

* Requiere autenticación.
* Solo muestra notificaciones del usuario.
* Filtra por estado/categoría.
* Pagina resultados.
* No muestra notificaciones de otros usuarios.

---

### US-009 — Marcar notificación como leída

Como usuario, quiero marcar una notificación como leída.

#### Criterios de aceptación

* La notificación pertenece al usuario.
* Actualiza `readAt`.
* Cambia estado si corresponde.
* No permite marcar notificación ajena.

---

### US-010 — Configurar preferencias básicas

Como usuario, quiero configurar preferencias de notificación por canal y categoría.

#### Criterios de aceptación

* Requiere autenticación.
* Solo modifica preferencias propias.
* No permite desactivar categorías obligatorias si la política no lo permite.
* Guarda cambios.
* Audita si aplica.

---

### US-011 — Registrar intento de entrega

Como sistema, quiero registrar intentos de entrega por canal para trazabilidad.

#### Criterios de aceptación

* Registra canal.
* Registra proveedor.
* Registra estado.
* Enmascara destino.
* No guarda secretos.
* Registra errores de forma segura.

---

### US-012 — Enviar email opcional

Como sistema, quiero enviar emails mediante un adaptador cuando el canal esté habilitado.

#### Criterios de aceptación

* Valida configuración.
* Valida email del destinatario.
* Respeta preferencias si aplica.
* Registra intento.
* Maneja fallo sin romper transacción principal.
* No expone datos sensibles.

---

## 16. Requisitos funcionales

### FR-001 — Crear comunicados

El sistema debe permitir crear comunicados administrativos por tenant.

---

### FR-002 — Editar comunicados

El sistema debe permitir editar comunicados en estado `draft` o `scheduled`.

---

### FR-003 — Publicar comunicados

El sistema debe permitir publicar comunicados a su audiencia.

---

### FR-004 — Programar comunicados

El sistema debe permitir dejar comunicados en estado `scheduled` con `publishAt`.

MVP puede implementar la estructura y diferir el scheduler automático.

---

### FR-005 — Archivar comunicados

El sistema debe permitir archivar comunicados sin eliminación física.

---

### FR-006 — Cancelar comunicados

El sistema debe permitir cancelar comunicados programados o borradores.

---

### FR-007 — Gestionar audiencia

El sistema debe permitir definir audiencia básica.

Audiencias MVP:

```text id="tv73fa"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

### FR-008 — Consultar comunicados administrativos

El sistema debe permitir listar y consultar comunicados por administradores.

---

### FR-009 — Consultar comunicados propios

El sistema debe permitir que usuarios consulten comunicados dirigidos a ellos o a sus unidades.

---

### FR-010 — Consultar comunicados públicos

El sistema debe exponer comunicados públicos para WordPress.

---

### FR-011 — Gestionar plantillas de notificación

El sistema debe permitir crear, consultar, actualizar, activar, desactivar y archivar plantillas.

---

### FR-012 — Generar notificaciones in-app

El sistema debe generar notificaciones internas por eventos relevantes.

---

### FR-013 — Consultar mis notificaciones

El sistema debe permitir listar notificaciones del usuario autenticado.

---

### FR-014 — Marcar notificaciones como leídas

El sistema debe permitir marcar notificaciones propias como leídas.

---

### FR-015 — Gestionar preferencias básicas

El sistema debe permitir definir preferencias por usuario, categoría y canal.

---

### FR-016 — Registrar intentos de entrega

El sistema debe registrar intentos por canal.

---

### FR-017 — Soportar email mediante adaptador

El sistema debe soportar integración opcional con proveedor email mediante puerto.

---

### FR-018 — Evitar duplicados

El sistema debe usar idempotencia para evitar notificaciones duplicadas por el mismo evento.

---

### FR-019 — Auditar operaciones críticas

El sistema debe auditar operaciones relevantes de comunicaciones y notificaciones.

---

### FR-020 — Proteger contenido privado

El sistema debe impedir exposición de contenido privado a usuarios no autorizados o endpoints públicos.

---

### FR-021 — Documentar API

El sistema debe documentar endpoints, permisos, errores, filtros y DTOs en OpenAPI.

---

## 17. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir tenant isolation, autorización por permiso, autorización por recurso propio y minimización de datos.

---

### NFR-002 — Privacidad

Las comunicaciones y notificaciones pueden contener datos personales, por tanto deben exponerse solo a audiencias autorizadas.

---

### NFR-003 — Trazabilidad

Publicaciones, envíos, lecturas relevantes, fallos e intentos de entrega deben ser trazables.

---

### NFR-004 — Disponibilidad

La caída de un proveedor externo de email no debe dejar inoperativo el Core.

---

### NFR-005 — Resiliencia

Los envíos externos deben poder reintentarse de forma controlada.

---

### NFR-006 — Performance

Objetivo MVP:

```text id="jrbawm"
p95 < 700 ms para listados paginados de comunicados o notificaciones con filtros comunes.
```

---

### NFR-007 — Escalabilidad progresiva

El diseño debe permitir colas asíncronas con BullMQ/Redis y futuros microservicios de mensajería.

---

### NFR-008 — API-first

Todas las funciones deben exponerse por REST API.

---

### NFR-009 — Observabilidad

El módulo debe emitir logs, métricas y auditoría sin exponer contenido sensible.

---

### NFR-010 — Extensibilidad

El diseño debe permitir canales futuros:

```text id="q0qqef"
whatsapp
sms
push
webhook
n8n
```

---

## 18. Permisos iniciales

### 18.1. Comunicados administrativos

```text id="i3k1ae"
communications.create
communications.read
communications.update
communications.publish
communications.cancel
communications.archive
communications.manageAudience
```

---

### 18.2. Comunicados propios

```text id="mkdj1g"
communications.read.own
communications.markRead.own
```

---

### 18.3. Comunicados públicos

```text id="gl7m3s"
communications.readPublic
```

Este permiso es conceptual para documentación interna. Los endpoints públicos no usan token de usuario final.

---

### 18.4. Plantillas

```text id="lw7wq6"
notificationTemplates.create
notificationTemplates.read
notificationTemplates.update
notificationTemplates.archive
```

---

### 18.5. Notificaciones administrativas

```text id="emlogj"
notifications.create
notifications.read
notifications.send
notifications.retry
notifications.cancel
notifications.readDeliveryAttempts
```

---

### 18.6. Notificaciones propias

```text id="w48hhk"
notifications.read.own
notifications.markRead.own
notificationPreferences.read.own
notificationPreferences.update.own
```

---

### 18.7. Auditoría y reportes

```text id="mt1ds9"
communications.audit.read
communications.reports.read
notifications.audit.read
notifications.reports.read
```

---

## 19. Matriz de permisos

| Acción                            | Permiso requerido                                        |
| --------------------------------- | -------------------------------------------------------- |
| Crear comunicado                  | `communications.create`                                  |
| Consultar comunicados admin       | `communications.read`                                    |
| Editar comunicado                 | `communications.update`                                  |
| Publicar comunicado               | `communications.publish`                                 |
| Cancelar comunicado               | `communications.cancel`                                  |
| Archivar comunicado               | `communications.archive`                                 |
| Gestionar audiencia               | `communications.manageAudience`                          |
| Consultar mis comunicados         | `communications.read.own`                                |
| Marcar comunicado como leído      | `communications.markRead.own`                            |
| Crear plantilla                   | `notificationTemplates.create`                           |
| Consultar plantilla               | `notificationTemplates.read`                             |
| Actualizar plantilla              | `notificationTemplates.update`                           |
| Archivar plantilla                | `notificationTemplates.archive`                          |
| Crear notificación manual         | `notifications.create`                                   |
| Consultar notificaciones admin    | `notifications.read`                                     |
| Enviar/reintentar notificación    | `notifications.send` / `notifications.retry`             |
| Cancelar notificación             | `notifications.cancel`                                   |
| Consultar intentos de entrega     | `notifications.readDeliveryAttempts`                     |
| Consultar mis notificaciones      | `notifications.read.own`                                 |
| Marcar mi notificación como leída | `notifications.markRead.own`                             |
| Consultar mis preferencias        | `notificationPreferences.read.own`                       |
| Actualizar mis preferencias       | `notificationPreferences.update.own`                     |
| Consultar auditoría               | `communications.audit.read` / `notifications.audit.read` |

---

## 20. API preliminar

### 20.1. Communications — administrativo

```text id="fslc1t"
GET    /api/v1/tenant/communications
POST   /api/v1/tenant/communications
GET    /api/v1/tenant/communications/{communicationId}
PATCH  /api/v1/tenant/communications/{communicationId}
POST   /api/v1/tenant/communications/{communicationId}/publish
POST   /api/v1/tenant/communications/{communicationId}/schedule
POST   /api/v1/tenant/communications/{communicationId}/cancel
POST   /api/v1/tenant/communications/{communicationId}/archive
GET    /api/v1/tenant/communications/{communicationId}/recipients
PUT    /api/v1/tenant/communications/{communicationId}/recipients
GET    /api/v1/tenant/communications/{communicationId}/read-receipts
```

---

### 20.2. Communications — propias

```text id="exir4y"
GET    /api/v1/me/communications
GET    /api/v1/me/communications/{communicationId}
POST   /api/v1/me/communications/{communicationId}/mark-read
```

---

### 20.3. Communications — públicas WordPress

```text id="zeasnr"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Nota:

```text id="j3jgki"
Estos endpoints complementan y formalizan lo ya previsto en 009-wordpress-integration-basic.
```

---

### 20.4. Notification Templates

```text id="kgkw96"
GET    /api/v1/tenant/notification-templates
POST   /api/v1/tenant/notification-templates
GET    /api/v1/tenant/notification-templates/{templateId}
PATCH  /api/v1/tenant/notification-templates/{templateId}
POST   /api/v1/tenant/notification-templates/{templateId}/activate
POST   /api/v1/tenant/notification-templates/{templateId}/deactivate
POST   /api/v1/tenant/notification-templates/{templateId}/archive
```

---

### 20.5. Notifications — administrativo

```text id="w2rjj2"
GET    /api/v1/tenant/notifications
POST   /api/v1/tenant/notifications
GET    /api/v1/tenant/notifications/{notificationId}
POST   /api/v1/tenant/notifications/{notificationId}/send
POST   /api/v1/tenant/notifications/{notificationId}/retry
POST   /api/v1/tenant/notifications/{notificationId}/cancel
GET    /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

---

### 20.6. Notifications — propias

```text id="tq59g4"
GET    /api/v1/me/notifications
GET    /api/v1/me/notifications/{notificationId}
POST   /api/v1/me/notifications/{notificationId}/mark-read
POST   /api/v1/me/notifications/mark-all-read
```

---

### 20.7. Notification Preferences — propias

```text id="lom9sd"
GET   /api/v1/me/notification-preferences
PUT   /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

---

## 21. Datos públicos para WordPress

### 21.1. Permitidos

Un comunicado público puede exponer:

```text id="faljdc"
id público
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

---

### 21.2. Prohibidos

No exponer públicamente:

```text id="inwl6p"
tenant internal id si genera enumeración
communication internal id secuencial
recipients
recipientUserIds
personIds
propertyUnitIds
roleIds
createdBy
updatedBy
publishedBy
readReceipts
deliveryAttempts
notification records
preferences
audit data
metadata interna
comunicados private/internal/tenant
notificaciones
datos personales
datos financieros privados
detalles de multas
detalles de pagos
evidencias
```

---

### 21.3. Regla de publicación pública

```text id="zslysc"
status = published
AND visibility = public
AND isPublicVisible = true
AND tenant.status = active
```

---

## 22. Reglas de integración con otros módulos

### 22.1. Payments

Eventos potenciales:

```text id="rt7qlo"
payment.reported
payment.confirmed
payment.rejected
payment.reversed
```

Notificaciones sugeridas:

```text id="fjq2dt"
Su pago fue recibido.
Su pago fue confirmado.
Su pago fue rechazado.
Su pago fue reversado.
```

Regla:

```text id="y8nwpt"
No incluir comprobantes, datos bancarios ni detalles financieros excesivos en canales externos.
```

---

### 22.2. Account Statements

Eventos potenciales:

```text id="esxdgp"
accountStatement.published
accountStatement.closed
```

Notificaciones sugeridas:

```text id="otfkqu"
Su estado de cuenta está disponible.
```

Regla:

```text id="c0z3im"
No enviar estado completo por email en MVP; redirigir a consulta autenticada.
```

---

### 22.3. Reservations

Eventos potenciales:

```text id="i5fbpc"
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
```

Notificaciones sugeridas:

```text id="xvxepc"
Su reserva fue recibida.
Su reserva fue aprobada.
Su reserva fue rechazada.
Su reserva fue cancelada.
```

---

### 22.4. Fines

Eventos potenciales:

```text id="u4yggc"
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.reversed
```

Notificaciones sugeridas:

```text id="oojscv"
Tiene una nueva multa emitida.
Su reclamo fue recibido.
Su reclamo fue resuelto.
```

Regla:

```text id="n719yf"
No incluir evidencias ni detalles sensibles de terceros en notificaciones externas.
```

---

### 22.5. Tenants

Eventos potenciales:

```text id="olrvgh"
tenant.created
tenant.suspended
tenant.reactivated
```

---

### 22.6. Users and Roles

Eventos potenciales:

```text id="hud7p8"
invitation.created
role.assigned
role.revoked
user.disabled
```

Notificaciones de seguridad deben tratarse como `mandatory` o `security`.

---

## 23. Auditoría

Eventos mínimos:

```text id="e7rtpu"
communication.created
communication.updated
communication.scheduled
communication.published
communication.cancelled
communication.archived
communication.audienceUpdated
communication.publicVisibilityChanged
communication.read
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
notificationPreference.updated
```

Metadata permitida:

```text id="hyukvc"
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

Metadata prohibida:

```text id="gp6ztd"
payload completo
body completo si contiene información privada
emails completos
teléfonos completos
tokens
secretos
cookies
Authorization header
provider credentials
provider raw response completo
datos financieros detallados
evidencias
comprobantes
```

---

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                               | Impacto    |
| ---------------------------------------------------- | ---------- |
| Comunicación cross-tenant                            | Crítico    |
| Notificación a destinatario equivocado               | Alto       |
| Exposición pública de comunicado privado             | Crítico    |
| Exposición de notificaciones privadas                | Crítico    |
| Envío de datos sensibles por canal externo           | Alto       |
| Fuga de emails/teléfonos                             | Alto       |
| Duplicación masiva de notificaciones                 | Medio/alto |
| Spam interno                                         | Medio      |
| Plantilla con variables no validadas                 | Alto       |
| Inyección de contenido                               | Alto       |
| Logs con contenido privado                           | Alto       |
| WordPress consume datos privados                     | Crítico    |
| Proveedor email caído bloquea transacción principal  | Medio      |
| Preferencias ignoradas indebidamente                 | Medio      |
| Notificaciones obligatorias bloqueadas indebidamente | Medio      |

---

### 24.2. Controles

```text id="u5cbgu"
tenant isolation
permission guards
own-resource authorization
audience validation
public visibility validation
safe public DTOs
notification preference validation
mandatory notification policy
template variable schema validation
HTML/content sanitization
delivery destination masking
idempotency keys
rate limiting
audit events
safe logs
safe metrics
no secrets in metadata
provider abstraction
no public private-notification endpoints
```

---

## 25. Observabilidad

Logs sugeridos:

```text id="j7v8qu"
communication.created
communication.updated
communication.published
communication.archived
communication.publicVisibilityChanged
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notificationDeliveryAttempt.failed
notificationPreference.updated
```

Métricas sugeridas:

```text id="sz6cgh"
communications_created_total
communications_published_total
communications_archived_total
notifications_created_total
notifications_sent_total
notifications_delivered_total
notifications_failed_total
notifications_read_total
notification_delivery_attempts_total
notification_delivery_failures_total
```

Labels permitidos:

```text id="l3k88i"
category
channel
status
priority
outcome
sourceType
```

Labels prohibidos:

```text id="xqx2q2"
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

## 26. Testing

### 26.1. Unit tests

Probar:

* entidades de comunicación;
* entidades de notificación;
* visibilidad;
* audiencia;
* plantillas;
* preferencias;
* idempotencia;
* sanitización;
* masking de destinos;
* estados.

---

### 26.2. Integration tests

Probar:

* creación de comunicado;
* publicación;
* archivo;
* audiencia;
* lectura propia;
* consulta pública;
* creación de notificación;
* lectura de notificación;
* delivery attempts;
* preferencias.

---

### 26.3. API tests

Probar:

* endpoints administrativos;
* endpoints propios;
* endpoints públicos;
* permisos;
* filtros;
* paginación;
* errores;
* OpenAPI.

---

### 26.4. Multitenancy tests

Probar:

* tenant A no ve comunicados tenant B;
* tenant A no ve notificaciones tenant B;
* tenant A no usa destinatarios tenant B;
* tenant A no usa plantillas tenant B;
* público tenant A no devuelve contenido tenant B.

---

### 26.5. Security tests

Probar:

* comunicado privado no aparece en público;
* comunicación interna no aparece en WordPress;
* notificaciones no tienen endpoint público;
* usuario no ve notificación ajena;
* usuario no marca como leída notificación ajena;
* preferencias solo propias;
* no emails completos en delivery attempt;
* logs sin contenido sensible.

---

### 26.6. Public integration tests

Probar:

```text id="ux2r98"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Casos:

* tenant activo;
* comunicado público publicado;
* comunicado interno no visible;
* comunicado expirado no visible;
* tenant suspendido no visible según política;
* no destinatarios en response;
* no metadata privada.

---

## 27. Criterios de aceptación globales

La spec se considera implementada si:

* se pueden crear comunicados;
* se pueden editar comunicados en estados permitidos;
* se pueden publicar comunicados;
* se pueden archivar comunicados;
* se puede definir audiencia básica;
* se pueden consultar comunicados administrativos;
* se pueden consultar comunicados propios;
* se pueden consultar comunicados públicos desde WordPress;
* los comunicados privados no son públicos;
* las notificaciones privadas no son públicas;
* se pueden crear plantillas;
* se pueden generar notificaciones in-app;
* se pueden consultar notificaciones propias;
* se pueden marcar notificaciones propias como leídas;
* se pueden registrar intentos de entrega;
* se pueden configurar preferencias básicas;
* se respeta tenant isolation;
* se respeta autorización por permiso;
* se respeta own-resource authorization;
* se evita duplicidad de notificaciones;
* se enmascaran destinos;
* se minimizan datos por canal;
* se auditan operaciones críticas;
* los logs no exponen contenido sensible;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas multitenant pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 28. Casos borde

| Caso                                            | Resultado esperado                 |
| ----------------------------------------------- | ---------------------------------- |
| Comunicado sin título                           | 422                                |
| Comunicado sin body                             | 422                                |
| Comunicado sin audiencia y no público           | 422                                |
| Comunicado público sin `isPublicVisible`        | no aparece en público              |
| Comunicado `draft` en endpoint público          | no aparece                         |
| Comunicado `internal` en endpoint público       | no aparece                         |
| Comunicado expirado                             | no aparece en público por defecto  |
| Tenant suspendido                               | política decide si oculta público  |
| Usuario sin permiso crea comunicado             | 403                                |
| Usuario sin relación consulta comunicado propio | 403                                |
| Usuario ve notificación ajena                   | 403/404                            |
| Usuario marca notificación ajena como leída     | 403/404                            |
| Plantilla inactiva usada                        | 422                                |
| Variables de plantilla inválidas                | 422                                |
| Email sin proveedor configurado                 | delivery skipped/failed controlado |
| Email sin destinatario                          | delivery skipped                   |
| Preferencia desactiva canal informativo         | no envía canal                     |
| Preferencia intenta bloquear mandatory          | no permitido                       |
| Idempotency key duplicada                       | no duplica notificación            |
| Delivery attempt falla                          | registra fallo                     |
| Provider responde error                         | error seguro y audit/log           |
| WordPress consulta notificaciones               | endpoint no existe                 |
| WordPress consulta comunicado privado           | 404                                |
| Logs con body completo sensible                 | no permitido                       |
| Destination completo en attempt                 | no permitido                       |

---

## 29. Dependencias hacia specs futuras

Este módulo habilita:

```text id="uxlrbp"
013-meetings-attendance
00X-notification-providers-email
00X-notification-providers-whatsapp
00X-notification-providers-sms
00X-push-notifications
00X-n8n-automation-integration
00X-advanced-communications
00X-document-delivery
00X-notification-analytics
00X-ai-assisted-communication-drafts
```

---

## 30. Archivos derivados esperados

```text id="qhh6zs"
docs/specs/012-communications-notifications/
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

1. ¿El MVP enviará email real o solo registrará notificación in-app?
2. ¿Qué proveedor email se usará: SES, SMTP, SendGrid, Mailgun u otro?
3. ¿Los comunicados públicos reemplazarán o complementarán los campos ACF de WordPress?
4. ¿Los comunicados públicos tendrán imágenes de portada desde Core o desde WordPress?
5. ¿Se permitirá programar publicación automática en MVP?
6. ¿Se permitirá expiración automática en MVP?
7. ¿Qué roles pueden publicar comunicados?
8. ¿Qué roles pueden enviar comunicaciones masivas?
9. ¿Los residentes podrán desactivar emails administrativos?
10. ¿Qué notificaciones serán obligatorias?
11. ¿Se mostrarán saldos exactos en notificaciones in-app?
12. ¿Se enviarán recordatorios financieros por email?
13. ¿Habrá límite diario de comunicaciones por tenant?
14. ¿Se requiere confirmación de lectura para comunicados importantes?
15. ¿Se permitirá adjuntar documentos a comunicados?
16. ¿Se permitirá segmentar por torre, manzana, bloque o etapa?
17. ¿Se permitirá comunicación bidireccional en el futuro?
18. ¿Se integrará n8n para flujos de notificación?
19. ¿Qué retención se aplicará a notificaciones antiguas?
20. ¿Se anonimizarán métricas por privacidad?

---

## 32. Decisión inicial para MVP

Para MVP se recomienda:

```text id="ihazq1"
- Crear comunicados administrativos.
- Gestionar estados draft, published, archived y cancelled.
- Preparar scheduled y expired aunque el scheduler pueda diferirse.
- Definir visibilidad private, internal, tenant y public.
- Definir audiencia básica.
- Consultar comunicados administrativos.
- Consultar comunicados propios.
- Exponer comunicados públicos a WordPress.
- Crear plantillas básicas de notificación.
- Generar notificaciones in-app.
- Consultar notificaciones propias.
- Marcar notificaciones propias como leídas.
- Registrar intentos de entrega.
- Preparar email mediante puerto/adaptador.
- Implementar preferencias básicas.
- Evitar duplicados con idempotencia.
- Auditar operaciones críticas.
- No implementar WhatsApp real todavía.
- No implementar SMS real todavía.
- No implementar push móvil todavía.
- No implementar chat bidireccional.
- No implementar IA con datos reales.
```

---

## 33. Conclusión

El módulo `012-communications-notifications` incorpora la capa formal de comunicación y notificación de RESIDENT Core.

Debe implementarse como un módulo:

```text id="krkdag"
tenant-scoped
permissioned
audience-aware
privacy-preserving
public-safe
event-aware
channel-aware
idempotent
auditable
extensible
```

No debe aceptarse una implementación que permita comunicaciones cross-tenant, exponga comunicados privados en WordPress, permita consultar notificaciones ajenas, envíe datos sensibles por canales externos, duplique notificaciones masivas, guarde destinos completos sin enmascarar, registre secretos en logs, omita auditoría o mezcle la lógica de comunicación con pagos, multas, reservas o estados de cuenta.
