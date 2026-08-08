# Tasks — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo           | Valor                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                     |
| Spec ID         | 012                                                                                                               |
| Módulo          | Communications and Notifications                                                                                  |
| Documento       | Implementation Tasks                                                                                              |
| Ruta            | `docs/specs/012-communications-notifications/tasks.md`                                                            |
| Versión         | 0.1                                                                                                               |
| Estado          | Borrador inicial                                                                                                  |
| Fecha           | 2026-07-19                                                                                                        |
| Documento base  | `docs/specs/012-communications-notifications/spec.md`                                                             |
| Plan técnico    | `docs/specs/012-communications-notifications/plan.md`                                                             |
| Modelo de datos | `docs/specs/012-communications-notifications/data-model.md`                                                       |
| Contrato API    | `docs/specs/012-communications-notifications/api-contract.md`                                                     |
| Plan de pruebas | `docs/specs/012-communications-notifications/test-plan.md`                                                        |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `009-wordpress-integration-basic`      |
| Relacionado con | `004-dues-fees`, `005-payments`, `006-account-statements`, `010-reservations-common-areas`, `011-fines-sanctions` |

---

## 2. Propósito

Este documento convierte la spec `012-communications-notifications` en una lista ejecutable de tareas para implementar el módulo de comunicaciones y notificaciones dentro de RESIDENT Core.

El módulo debe permitir:

* crear comunicados administrativos;
* editar comunicados en estados permitidos;
* publicar comunicados;
* programar comunicados;
* cancelar comunicados;
* archivar comunicados;
* definir audiencia básica;
* consultar comunicados administrativos;
* consultar comunicados propios;
* marcar comunicados como leídos;
* exponer comunicados públicos hacia WordPress;
* crear plantillas básicas de notificación;
* generar notificaciones in-app;
* consultar notificaciones administrativas;
* consultar notificaciones propias;
* marcar notificaciones como leídas;
* registrar intentos de entrega;
* soportar email mediante puerto/adaptador opcional o `noop`;
* gestionar preferencias básicas;
* evitar duplicados mediante idempotencia;
* enmascarar destinos externos;
* auditar operaciones críticas;
* impedir exposición pública de contenido privado.

Regla central:

```text
Toda comunicación o notificación debe ser tenant-scoped, permissioned, audience-aware, visibility-controlled, own-resource protected, public-safe, idempotent, delivery-traceable y auditable.
```

---

## 3. Convenciones de estado

Usar:

```text
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/007-audit/
docs/specs/009-wordpress-integration-basic/
docs/specs/010-reservations-common-areas/
docs/specs/011-fines-sanctions/
docs/specs/012-communications-notifications/
```

Reglas de implementación:

```text
1. Toda tabla tenant-scoped debe incluir tenant_id.
2. Toda consulta tenant-scoped debe filtrar por tenant_id.
3. No se acepta tenantId desde body.
4. No se busca communication solo por communicationId.
5. No se busca notification solo por notificationId.
6. No se busca notificationTemplate solo por templateId sin tenant o regla global.
7. No se busca deliveryAttempt solo por attemptId.
8. No se busca notificationPreference solo por preferenceId.
9. No se permite usar userId de otro tenant.
10. No se permite usar personId de otro tenant.
11. No se permite usar propertyUnitId de otro tenant.
12. No se permite usar roleId de otro tenant.
13. No se permite mezclar recipients entre tenants.
14. No se permite exponer recipients en endpoints públicos.
15. No se permite exponer readReceipts en endpoints públicos.
16. No se permite exponer notifications en endpoints públicos.
17. No se permite exponer deliveryAttempts en endpoints públicos.
18. No se permite exponer notificationPreferences en endpoints públicos.
19. No se permite exponer metadata interna en endpoints públicos.
20. WordPress solo puede consultar announcements públicos.
21. WordPress no puede consultar notificaciones.
22. WordPress no puede consultar destinatarios.
23. WordPress no puede consultar intentos de entrega.
24. WordPress no puede marcar lecturas.
25. Communication public requiere status=published.
26. Communication public requiere visibility=public.
27. Communication public requiere isPublicVisible=true.
28. Communication public requiere tenant activo.
29. Communication expired no debe aparecer públicamente por defecto.
30. Communication archived no debe aparecer públicamente.
31. Communication private/internal/tenant no debe aparecer públicamente.
32. Notificación propia solo puede verla recipientUserId.
33. Usuario no puede marcar notificación ajena como leída.
34. Usuario no puede modificar preferencias ajenas.
35. Preference mandatory/security no debe desactivarse si política lo bloquea.
36. Plantilla inactiva no debe usarse para nuevas notificaciones.
37. Variables de plantilla deben validarse.
38. Templates deben sanitizar salida renderizada.
39. Canales externos deben registrar deliveryAttempt.
40. Canales externos deben almacenar destinationMasked.
41. No se debe almacenar email completo en deliveryAttempt.
42. No se debe almacenar teléfono completo en deliveryAttempt.
43. No se deben guardar credenciales de proveedor.
44. No se debe guardar raw provider response completo.
45. No se debe loguear body privado completo.
46. No se debe loguear Authorization header.
47. No se deben loguear tokens, cookies ni secretos.
48. Notificaciones por evento deben usar idempotencyKey.
49. Reintentos no deben duplicar Notification.
50. Una Notification puede tener múltiples DeliveryAttempts.
51. Fallo de proveedor externo no debe romper transacción principal salvo política crítica explícita.
52. No implementar WhatsApp real en esta spec.
53. No implementar SMS real en esta spec.
54. No implementar push móvil real en esta spec.
55. No implementar chat en esta spec.
56. No implementar marketing automation en esta spec.
57. No usar IA externa con datos reales.
58. Toda publicación crítica debe auditarse.
59. Todo cambio de audiencia debe auditarse.
60. Todo envío, fallo y reintento relevante debe auditarse.
```

---

## 5. Entregables esperados

Documentación:

```text
docs/specs/012-communications-notifications/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text
apps/api/src/modules/communications/
├── communications.module.ts
├── communications.controller.ts
├── my-communications.controller.ts
├── public-announcements.controller.ts
├── notification-templates.controller.ts
├── notifications.controller.ts
├── my-notifications.controller.ts
├── notification-preferences.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

Base de datos:

```text
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text
docs/specs/012-communications-notifications/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura de specs anteriores.
* No reemplaza documentos de specs `001` a `011`.

---

## TASK-002 — Registrar especificación funcional

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define entidades.
* Define estados.
* Define permisos.
* Define API preliminar.
* Define integración con WordPress.
* Define riesgos.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/plan.md
```

### Criterios de aceptación

* Define estructura técnica.
* Define carpetas.
* Define servicios.
* Define casos de uso.
* Define puertos.
* Define repositorios.
* Define integración con delivery.
* Define integración con WordPress.
* Define observabilidad.
* Define seguridad.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define enums.
* Define Prisma preliminar.
* Define relaciones.
* Define constraints.
* Define índices.
* Define reglas de audiencia.
* Define reglas de visibilidad pública.
* Define reglas de idempotencia.
* Define reglas de preferencias.
* Define reglas de masking.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/api-contract.md
```

### Criterios de aceptación

* Define endpoints administrativos.
* Define endpoints `/me`.
* Define endpoints públicos WordPress.
* Define permisos.
* Define headers.
* Define DTOs.
* Define responses.
* Define errores.
* Define filtros.
* Define paginación.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define DTO tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own-resource tests.
* Define multitenancy tests.
* Define public safety tests.
* Define delivery tests.
* Define preference tests.
* Define audit tests.
* Define OpenAPI tests.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Estados definidos.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.
* Checklist PR incluido.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/012-communications-notifications/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos cross-tenant.
* Identifica riesgos de exposición pública.
* Identifica riesgos de notificaciones ajenas.
* Identifica riesgos de destinatarios.
* Identifica riesgos de canales externos.
* Identifica riesgos de plantillas.
* Identifica riesgos de logs.
* Define controles de auditoría.
* Define controles de privacidad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `communications`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/communications/communications.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en `AppModule` o módulo funcional equivalente.
* Exporta providers necesarios.
* No contiene lógica de negocio.
* Respeta arquitectura modular.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text
apps/api/src/modules/communications/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── delivery/
│   ├── queue/
│   ├── integrations/
│   └── audit/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de Prisma.
* Controladores no acceden directamente a Prisma.
* Servicios no exponen detalles de infraestructura.
* Repositorios viven en infraestructura.
* Delivery providers están detrás de puertos.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text
communications.controller.ts
my-communications.controller.ts
public-announcements.controller.ts
notification-templates.controller.ts
notifications.controller.ts
my-notifications.controller.ts
notification-preferences.controller.ts
```

### Criterios de aceptación

* Controladores compilan.
* Rutas base correctas.
* No contienen lógica de negocio.
* Invocan casos de uso.
* Aplican guards/decorators según corresponda.

---

## TASK-012 — Registrar módulo en bounded context

**Estado:** `[ ] Pending`

### Contexto

```text
Communications and Notifications
```

### Criterios de aceptación

* El módulo queda alineado con `docs/sdd/domain-map.md`.
* No se mezcla con `Payments`.
* No se mezcla con `Fines`.
* No se mezcla con `Reservations`.
* No se mezcla con `Meetings`.
* Solo informa eventos; no ejecuta decisiones de dominio ajeno.

---

# 8. Fase 2 — Value Objects

## TASK-013 — Implementar `CommunicationStatus`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-status.vo.ts
```

### Criterios de aceptación

* Soporta `draft`.
* Soporta `scheduled`.
* Soporta `published`.
* Soporta `expired`.
* Soporta `archived`.
* Soporta `cancelled`.
* Identifica estados editables.
* Identifica estados publicables.
* Identifica estados terminales.
* Tiene unit tests.

---

## TASK-014 — Implementar `CommunicationVisibility`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-visibility.vo.ts
```

### Criterios de aceptación

* Soporta `private`.
* Soporta `internal`.
* Soporta `tenant`.
* Soporta `public`.
* Identifica si puede exponerse a WordPress.
* Tiene unit tests.

---

## TASK-015 — Implementar `CommunicationCategory`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-category.vo.ts
```

### Criterios de aceptación

* Soporta categorías definidas en `data-model.md`.
* Rechaza valores desconocidos.
* Tiene unit tests.

---

## TASK-016 — Implementar `CommunicationPriority`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-priority.vo.ts
```

### Criterios de aceptación

* Soporta `low`.
* Soporta `normal`.
* Soporta `high`.
* Soporta `urgent`.
* Tiene unit tests.

---

## TASK-017 — Implementar `AudienceType`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-audience-type.vo.ts
```

### Criterios de aceptación

* Soporta `allTenantUsers`.
* Soporta `owners`.
* Soporta `residents`.
* Soporta `propertyUnits`.
* Soporta `roles`.
* Soporta `specificUsers`.
* Soporta `mixed`.
* Tiene unit tests.

---

## TASK-018 — Implementar `CommunicationRecipientType`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-recipient-type.vo.ts
```

### Criterios de aceptación

* Soporta `user`.
* Soporta `person`.
* Soporta `propertyUnit`.
* Soporta `role`.
* Soporta `owner`.
* Soporta `resident`.
* Soporta `allTenantUsers`.
* Define qué campos exige cada tipo.
* Tiene unit tests.

---

## TASK-019 — Implementar `CommunicationTitle`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-title.vo.ts
```

### Criterios de aceptación

* Valida título obligatorio.
* Rechaza vacío.
* Rechaza solo espacios.
* Limita longitud.
* Normaliza espacios.
* Bloquea contenido peligroso si aplica.
* Tiene unit tests.

---

## TASK-020 — Implementar `CommunicationBody`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/communication-body.vo.ts
```

### Criterios de aceptación

* Valida cuerpo obligatorio.
* Rechaza vacío.
* Limita longitud.
* Sanitiza HTML permitido.
* Bloquea `<script>`.
* Bloquea `<iframe>`.
* Bloquea handlers inline.
* Tiene unit tests.

---

## TASK-021 — Implementar `NotificationStatus`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-status.vo.ts
```

### Criterios de aceptación

* Soporta `pending`.
* Soporta `sent`.
* Soporta `delivered`.
* Soporta `failed`.
* Soporta `read`.
* Soporta `archived`.
* Soporta `cancelled`.
* Identifica estados leíbles.
* Identifica estados terminales.
* Tiene unit tests.

---

## TASK-022 — Implementar `NotificationChannel`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-channel.vo.ts
```

### Criterios de aceptación

* Soporta `inApp`.
* Soporta `email`.
* Soporta `whatsapp`.
* Soporta `sms`.
* Soporta `push`.
* Soporta `webhook`.
* Identifica canales MVP.
* Identifica canales diferidos.
* Tiene unit tests.

---

## TASK-023 — Implementar `NotificationCategory`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-category.vo.ts
```

### Criterios de aceptación

* Soporta `mandatory`.
* Soporta `administrative`.
* Soporta `financial`.
* Soporta `security`.
* Soporta `operational`.
* Soporta `reservation`.
* Soporta `fine`.
* Soporta `meeting`.
* Soporta `informational`.
* Soporta `system`.
* Identifica categorías obligatorias.
* Tiene unit tests.

---

## TASK-024 — Implementar `NotificationPriority`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-priority.vo.ts
```

### Criterios de aceptación

* Soporta `low`.
* Soporta `normal`.
* Soporta `high`.
* Soporta `urgent`.
* Tiene unit tests.

---

## TASK-025 — Implementar `NotificationTemplateStatus`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-template-status.vo.ts
```

### Criterios de aceptación

* Soporta `active`.
* Soporta `inactive`.
* Soporta `archived`.
* Define si la plantilla puede usarse.
* Tiene unit tests.

---

## TASK-026 — Implementar `NotificationTemplateCode`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/notification-template-code.vo.ts
```

### Criterios de aceptación

* Acepta códigos tipo `PAYMENT_CONFIRMED`.
* Acepta códigos tipo `RESERVATION_APPROVED`.
* Acepta códigos tipo `FINE_ISSUED`.
* Rechaza vacío.
* Rechaza espacios.
* Rechaza caracteres peligrosos.
* Limita longitud.
* Tiene unit tests.

---

## TASK-027 — Implementar `DeliveryAttemptStatus`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/delivery-attempt-status.vo.ts
```

### Criterios de aceptación

* Soporta `pending`.
* Soporta `sent`.
* Soporta `delivered`.
* Soporta `failed`.
* Soporta `cancelled`.
* Soporta `skipped`.
* Tiene unit tests.

---

## TASK-028 — Implementar `MaskedDestination`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/value-objects/masked-destination.vo.ts
```

### Criterios de aceptación

* Enmascara emails.
* Enmascara teléfonos.
* Nunca devuelve destino completo.
* Rechaza destino vacío en canales externos.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades, eventos y errores de dominio

## TASK-029 — Implementar `Communication`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/communication.entity.ts
```

### Criterios de aceptación

* Representa comunicado.
* Valida tenant.
* Valida título.
* Valida body.
* Valida visibilidad.
* Valida estado.
* Valida audiencia.
* Valida reglas public-safe.
* Controla transiciones.
* Tiene unit tests.

---

## TASK-030 — Implementar `CommunicationRecipient`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/communication-recipient.entity.ts
```

### Criterios de aceptación

* Representa destinatario o segmento.
* Valida tenant.
* Valida `communicationId`.
* Valida `recipientType`.
* Exige ID cuando corresponde.
* Tiene unit tests.

---

## TASK-031 — Implementar `CommunicationReadReceipt`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/communication-read-receipt.entity.ts
```

### Criterios de aceptación

* Representa lectura.
* Valida tenant.
* Valida `communicationId`.
* Valida `userId`.
* Soporta idempotencia conceptual.
* Tiene unit tests.

---

## TASK-032 — Implementar `NotificationTemplate`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/notification-template.entity.ts
```

### Criterios de aceptación

* Representa plantilla.
* Valida código.
* Valida canal.
* Valida categoría.
* Valida `subjectTemplate` para email.
* Valida `variablesSchema`.
* Bloquea uso si está inactive/archived.
* Protege `isSystem`.
* Tiene unit tests.

---

## TASK-033 — Implementar `Notification`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/notification.entity.ts
```

### Criterios de aceptación

* Representa notificación.
* Valida tenant.
* Valida destinatario.
* Valida canal.
* Valida categoría.
* Valida título.
* Valida body.
* Valida estado.
* Controla `readAt`.
* Soporta `idempotencyKey`.
* Tiene unit tests.

---

## TASK-034 — Implementar `NotificationDeliveryAttempt`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/notification-delivery-attempt.entity.ts
```

### Criterios de aceptación

* Representa intento de entrega.
* Valida tenant.
* Valida notificationId.
* Valida canal.
* Exige `destinationMasked` para canales externos.
* Valida `attemptNumber >= 1`.
* Sanitiza errorMessage.
* Tiene unit tests.

---

## TASK-035 — Implementar `NotificationPreference`

**Estado:** `[ ] Pending`

### Archivo

```text
domain/entities/notification-preference.entity.ts
```

### Criterios de aceptación

* Representa preferencia.
* Valida tenant.
* Valida userId.
* Valida categoría.
* Valida canal.
* Bloquea categorías obligatorias según política.
* Tiene unit tests.

---

## TASK-036 — Implementar eventos de comunicaciones

**Estado:** `[ ] Pending`

### Eventos

```text
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

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen communicationId.
* Incluyen actorUserId cuando aplique.
* Incluyen traceId.
* No incluyen body completo privado.
* Metadata sanitizada.
* Tienen tests.

---

## TASK-037 — Implementar eventos de plantillas

**Estado:** `[ ] Pending`

### Eventos

```text
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
```

### Criterios de aceptación

* Incluyen tenantId o indicador global.
* Incluyen templateId.
* Incluyen actorUserId.
* Incluyen traceId.
* No incluyen secretos.
* Metadata sanitizada.

---

## TASK-038 — Implementar eventos de notificaciones

**Estado:** `[ ] Pending`

### Eventos

```text
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen notificationId.
* Incluyen recipientUserId si aplica.
* Incluyen channel.
* Incluyen sourceType/sourceId.
* No incluyen body completo privado.
* No incluyen destino completo.
* Metadata sanitizada.

---

## TASK-039 — Implementar eventos de delivery attempts y preferencias

**Estado:** `[ ] Pending`

### Eventos

```text
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
notificationPreference.updated
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen notificationId o preferenceId.
* Incluyen channel/category.
* No incluyen email completo.
* No incluyen teléfono completo.
* No incluyen provider raw response.
* Metadata sanitizada.

---

## TASK-040 — Implementar errores de comunicaciones

**Estado:** `[ ] Pending`

### Errores

```text
communication-not-found.error.ts
communication-forbidden.error.ts
communication-invalid-status-transition.error.ts
communication-audience-required.error.ts
communication-publication-not-allowed.error.ts
communication-private-public-exposure.error.ts
communication-recipient-invalid.error.ts
communication-cross-tenant-reference.error.ts
communication-duplicate-slug.error.ts
communication-content-invalid.error.ts
communication-expired.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* Tiene tests.

---

## TASK-041 — Implementar errores de notificaciones y plantillas

**Estado:** `[ ] Pending`

### Errores

```text
notification-template-not-found.error.ts
notification-template-inactive.error.ts
notification-template-duplicate-code.error.ts
notification-template-variables-invalid.error.ts
notification-not-found.error.ts
notification-forbidden.error.ts
notification-invalid-transition.error.ts
notification-duplicate.error.ts
notification-channel-not-configured.error.ts
notification-delivery-failed.error.ts
notification-max-attempts-exceeded.error.ts
notification-preference-not-found.error.ts
notification-preference-forbidden.error.ts
notification-mandatory-preference-locked.error.ts
notification-cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Códigos alineados con `api-contract.md`.
* Mapeo HTTP correcto.
* Mensajes seguros.
* Tienen tests.

---

# 10. Fase 4 — Base de datos y Prisma

## TASK-042 — Crear migración `012_create_communications_notifications`

**Estado:** `[ ] Pending`

### Nombre sugerido

```text
012_create_communications_notifications
```

### Criterios de aceptación

* Crea enums.
* Crea `communications`.
* Crea `communication_recipients`.
* Crea `communication_read_receipts`.
* Crea `notification_templates`.
* Crea `notifications`.
* Crea `notification_delivery_attempts`.
* Crea `notification_preferences`.
* Crea índices.
* Crea constraints básicos.
* Ejecuta en DB test.
* No rompe specs anteriores.

---

## TASK-043 — Agregar enums Prisma

**Estado:** `[ ] Pending`

### Enums

```text
CommunicationStatus
CommunicationVisibility
CommunicationCategory
CommunicationPriority
AudienceType
CommunicationRecipientType
NotificationTemplateStatus
NotificationStatus
NotificationChannel
NotificationCategory
NotificationPriority
DeliveryAttemptStatus
NotificationSourceType
```

### Criterios de aceptación

* Enums definidos.
* Mapeados correctamente a valores persistidos.
* Prisma Client genera.
* Tests compilan.

---

## TASK-044 — Agregar modelo `Communication`

**Estado:** `[ ] Pending`

### Archivo

```text
prisma/schema.prisma
```

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relaciones con UserProfile para createdBy/updatedBy/publishedBy/archivedBy.
* Unique `(tenantId, slug)`.
* Unique `(tenantId, publicId)`.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-045 — Agregar modelo `CommunicationRecipient`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Communication.
* Relación opcional con UserProfile.
* Relación opcional con Person.
* Relación opcional con PropertyUnit.
* Relación conceptual con Role/TenantRole según spec 002.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-046 — Agregar modelo `CommunicationReadReceipt`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Communication.
* Relación con UserProfile.
* Unique `(tenantId, communicationId, userId)`.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-047 — Agregar modelo `NotificationTemplate`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* `tenantId` nullable para plantillas globales.
* Relación opcional con Tenant.
* Unique `(tenantId, code, channel)`.
* Índices creados.
* Soft archive con `archivedAt`.
* Soporta `isSystem`.

---

## TASK-048 — Agregar modelo `Notification`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con UserProfile recipient.
* Relación opcional con Person.
* Relación opcional con PropertyUnit.
* Relación opcional con NotificationTemplate.
* Unique `(tenantId, idempotencyKey)`.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-049 — Agregar modelo `NotificationDeliveryAttempt`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Notification.
* `attemptNumber` default 1.
* Índices creados.
* No almacena destino completo.
* No almacena credenciales.

---

## TASK-050 — Agregar modelo `NotificationPreference`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con UserProfile.
* Unique `(tenantId, userId, category, channel)`.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-051 — Agregar relaciones en modelos existentes

**Estado:** `[ ] Pending`

### Modelos

```text
Tenant
UserProfile
Person
PropertyUnit
Role / TenantRole según implementación
```

### Criterios de aceptación

* Relaciones agregadas sin romper specs anteriores.
* Prisma Client genera.
* Tests existentes siguen pasando.

---

## TASK-052 — Agregar constraints SQL recomendadas

**Estado:** `[ ] Pending`

### Constraints

```text
notification_delivery_attempts.attempt_number >= 1
communications.is_public_visible=true requiere visibility='public'
communications.expires_at posterior a publish_at si aplica
```

### Criterios de aceptación

* Constraints aplicadas por migración raw o servicio.
* DB test valida constraints si son DB-level.
* Errores se traducen a errores de dominio/API.

---

## TASK-053 — Agregar índice parcial para plantillas globales

**Estado:** `[-] Deferred`

### Índice recomendado

```sql
CREATE UNIQUE INDEX notification_templates_global_code_channel_unique
ON notification_templates(code, channel)
WHERE tenant_id IS NULL AND archived_at IS NULL;
```

### Razón

Puede diferirse si el MVP controla esta regla en servicio.

### Criterios futuros

* Evaluar compatibilidad con Prisma.
* Agregar migración raw si aplica.
* Agregar tests DB.
* Documentar decisión.

---

## TASK-054 — Crear seeds demo

**Estado:** `[ ] Pending`

### Seeds

```text
communicationGeneralPublishedA
communicationMaintenanceDraftA
communicationPublicAnnouncementA
communicationFinancialTenantA
communicationInternalAdminA
communicationExpiredPublicA
communicationArchivedA
communicationTenantB
recipientAllTenantUsersA
recipientOwnersA
recipientResidentsA
recipientPropertyUnitA101
recipientRoleAdminA
recipientSpecificUserA
readReceiptOwnerA
readReceiptResidentA
templatePaymentConfirmedInApp
templateAccountStatementPublishedInApp
templateReservationApprovedInApp
templateFineIssuedInApp
templateGenericEmail
notificationPaymentConfirmedA
notificationStatementPublishedA
notificationReservationApprovedA
notificationFineIssuedA
notificationUnreadA
notificationReadA
notificationFailedEmailA
deliveryAttemptEmailFailedA
deliveryAttemptEmailSkippedA
preferenceOwnerInformationalEmailDisabled
preferenceOwnerSecurityInAppEnabled
```

### Criterios de aceptación

* No usan datos reales.
* No usan emails reales.
* No usan teléfonos reales.
* No usan credenciales reales.
* No usan provider IDs reales.
* Permiten probar API.
* Permiten probar flujo completo.

---

# 11. Fase 5 — DTOs y validación

## TASK-055 — Crear DTOs de comunicaciones administrativas

**Estado:** `[ ] Pending`

### Archivos

```text
create-communication.dto.ts
update-communication.dto.ts
communication-admin.dto.ts
communication-list-item.dto.ts
communication-list-query.dto.ts
publish-communication.dto.ts
schedule-communication.dto.ts
cancel-communication.dto.ts
archive-communication.dto.ts
```

### Criterios de aceptación

* Valida title.
* Valida slug.
* Valida summary.
* Valida body.
* Valida category.
* Valida visibility.
* Valida priority.
* Valida audienceType.
* Valida isPublicVisible.
* Valida publishAt/expiresAt.
* Rechaza `tenantId`.
* Rechaza `status` en PATCH genérico.
* Rechaza campos auditables desde body.
* Tiene DTO tests.

---

## TASK-056 — Crear DTOs de audiencia y destinatarios

**Estado:** `[ ] Pending`

### Archivos

```text
communication-recipient.dto.ts
update-communication-recipients.dto.ts
communication-read-receipt.dto.ts
communication-read-receipt-query.dto.ts
```

### Criterios de aceptación

* Valida recipientType.
* Exige userId/personId/propertyUnitId/roleId según tipo.
* Permite owner/resident/allTenantUsers sin ID.
* Rechaza combinaciones inválidas.
* Rechaza tenantId.
* Tiene DTO tests.

---

## TASK-057 — Crear DTOs de comunicaciones propias y públicas

**Estado:** `[ ] Pending`

### Archivos

```text
own-communication.dto.ts
own-communication-list-query.dto.ts
mark-communication-read.dto.ts
public-announcement.dto.ts
public-announcement-list-query.dto.ts
```

### Criterios de aceptación

* Own DTO minimizado.
* Public DTO public-safe.
* No incluye recipients.
* No incluye metadata interna.
* No incluye audit data.
* No incluye internal IDs sensibles.
* Tiene tests.

---

## TASK-058 — Crear DTOs de plantillas

**Estado:** `[ ] Pending`

### Archivos

```text
create-notification-template.dto.ts
update-notification-template.dto.ts
notification-template.dto.ts
notification-template-list-query.dto.ts
```

### Criterios de aceptación

* Valida code.
* Valida name.
* Valida category.
* Valida channel.
* Valida subjectTemplate para email.
* Valida bodyTemplate.
* Valida variablesSchema.
* Rechaza tenantId.
* Tiene DTO tests.

---

## TASK-059 — Crear DTOs de notificaciones administrativas

**Estado:** `[ ] Pending`

### Archivos

```text
create-notification.dto.ts
notification-admin.dto.ts
notification-list-query.dto.ts
send-notification.dto.ts
retry-notification.dto.ts
cancel-notification.dto.ts
notification-delivery-attempt.dto.ts
notification-delivery-attempt-list-query.dto.ts
```

### Criterios de aceptación

* Valida recipientUserId.
* Valida propertyUnitId.
* Valida templateId.
* Valida sourceType/sourceId.
* Valida category.
* Valida channel.
* Valida title/body.
* Valida priority.
* Valida actionUrl.
* Rechaza tenantId.
* Rechaza status manual si no aplica.
* Tiene DTO tests.

---

## TASK-060 — Crear DTOs de notificaciones propias y preferencias

**Estado:** `[ ] Pending`

### Archivos

```text
own-notification.dto.ts
own-notification-list-query.dto.ts
mark-notification-read.dto.ts
mark-all-notifications-read.dto.ts
notification-preference.dto.ts
update-notification-preferences.dto.ts
patch-notification-preference.dto.ts
```

### Criterios de aceptación

* OwnNotificationDto minimizado.
* No incluye recipientUserId.
* No incluye deliveryAttempts.
* No incluye metadata interna.
* Preference DTO no permite userId/tenantId.
* Tiene DTO tests.

---

## TASK-061 — Crear response wrappers

**Estado:** `[ ] Pending`

### Archivos

```text
communication-response.dto.ts
communication-paginated-response.dto.ts
notification-response.dto.ts
notification-paginated-response.dto.ts
```

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No retorna entidades internas.
* No retorna tokens ni secretos.
* Tiene tests.

---

# 12. Fase 6 — Puertos y repositorios

## TASK-062 — Crear puertos de comunicaciones

**Estado:** `[ ] Pending`

### Archivos

```text
communication-reader.port.ts
communication-writer.port.ts
```

### Criterios de aceptación

* Define lectura por tenant.
* Define lectura por slug.
* Define listados.
* Define listados propios.
* Define listados públicos.
* Define create/update/status/archive.
* No opera sin tenant.

---

## TASK-063 — Crear puertos de recipients y read receipts

**Estado:** `[ ] Pending`

### Archivos

```text
communication-recipient-reader.port.ts
communication-recipient-writer.port.ts
communication-read-receipt-reader.port.ts
communication-read-receipt-writer.port.ts
```

### Criterios de aceptación

* Lista recipients.
* Reemplaza recipients.
* Resuelve audiencia.
* Valida acceso de usuario.
* Marca lectura idempotente.
* No opera sin tenant.

---

## TASK-064 — Crear puertos de plantillas

**Estado:** `[ ] Pending`

### Archivos

```text
notification-template-reader.port.ts
notification-template-writer.port.ts
```

### Criterios de aceptación

* Busca por id+tenant.
* Busca por code/channel.
* Soporta plantillas globales.
* Crea/actualiza/activa/desactiva/archiva.
* No opera sin reglas de tenant/global.

---

## TASK-065 — Crear puertos de notificaciones

**Estado:** `[ ] Pending`

### Archivos

```text
notification-reader.port.ts
notification-writer.port.ts
```

### Criterios de aceptación

* Busca por id+tenant.
* Lista admin.
* Lista propias.
* Busca por idempotencyKey.
* Crea notificación.
* Marca leída.
* Cancela.
* Archiva.
* No opera sin tenant.

---

## TASK-066 — Crear puertos de delivery attempts y preferencias

**Estado:** `[ ] Pending`

### Archivos

```text
notification-delivery-attempt-reader.port.ts
notification-delivery-attempt-writer.port.ts
notification-preference-reader.port.ts
notification-preference-writer.port.ts
```

### Criterios de aceptación

* Crea delivery attempts.
* Actualiza estado de delivery attempt.
* Lista por notificationId+tenant.
* Consulta preferencias por user/category/channel.
* Upsert de preferencias.
* No opera sin tenant.

---

## TASK-067 — Crear puertos de integración con usuarios y unidades

**Estado:** `[ ] Pending`

### Archivos

```text
communication-user-directory.port.ts
communication-property-unit.port.ts
```

### Criterios de aceptación

* Valida usuarios por tenant.
* Resuelve usuarios por rol.
* Resuelve usuarios owners/residents.
* Valida unidades por tenant.
* Resuelve unidades del usuario.
* Valida relación user-propertyUnit.
* Se integra con specs `002` y `003`.

---

## TASK-068 — Crear puertos de delivery externo, cola y auditoría

**Estado:** `[ ] Pending`

### Archivos

```text
notification-email-provider.port.ts
notification-queue.port.ts
communication-audit.port.ts
```

### Criterios de aceptación

* Email provider no expone credenciales.
* Queue permite enqueue delivery/retry.
* Audit port sanitiza metadata.
* Puertos tienen tests de contrato.

---

## TASK-069 — Implementar repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text
prisma-communication.repository.ts
prisma-communication-recipient.repository.ts
prisma-communication-read-receipt.repository.ts
prisma-notification-template.repository.ts
prisma-notification.repository.ts
prisma-notification-delivery-attempt.repository.ts
prisma-notification-preference.repository.ts
communications.mapper.ts
```

### Criterios de aceptación

* Todos filtran por tenant_id.
* No buscan solo por id.
* No exponen metadata privada en mappers públicos.
* Soportan paginación.
* Soportan filtros principales.
* Tienen integration tests.

---

## TASK-070 — Implementar adapters de delivery y queue

**Estado:** `[ ] Pending`

### Archivos

```text
in-app-notification.adapter.ts
email-notification.adapter.ts
noop-notification-provider.adapter.ts
sync-notification-queue.adapter.ts
bullmq-notification-queue.adapter.ts
```

### Criterios de aceptación

* In-app crea notificación delivered.
* Email provider usa puerto.
* Noop registra skipped/failed controlado.
* Sync queue permite MVP sin Redis si aplica.
* BullMQ queda preparado si Redis está disponible.
* No guarda secretos.
* Tiene tests.

---

## TASK-071 — Implementar adapters de integraciones y auditoría

**Estado:** `[ ] Pending`

### Archivos

```text
communication-user-directory.adapter.ts
communication-property-unit.adapter.ts
communication-audit.adapter.ts
```

### Criterios de aceptación

* User directory usa datos de `002-users-roles`.
* Property unit usa datos de `003-residents-properties`.
* Audit adapter publica eventos hacia `007-audit`.
* Metadata sanitizada.
* Tiene tests.

---

# 13. Fase 7 — Servicios de aplicación

## TASK-072 — Implementar `CommunicationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crea comunicados.
* Actualiza comunicados.
* Valida estado editable.
* Valida slug único.
* Coordina audiencia.
* Audita create/update.
* Tiene tests.

---

## TASK-073 — Implementar `CommunicationAudienceService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida audiencia.
* Resuelve destinatarios.
* Impide referencias cross-tenant.
* Soporta allTenantUsers.
* Soporta owners.
* Soporta residents.
* Soporta propertyUnits.
* Soporta roles.
* Soporta specificUsers.
* Soporta mixed.
* Deduplica usuarios finales.
* Tiene tests.

---

## TASK-074 — Implementar `CommunicationPublicationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Publica comunicados.
* Programa comunicados.
* Cancela comunicados.
* Archiva comunicados.
* Valida public-safe.
* Valida audiencia.
* Crea notificaciones si `notifyAudience=true`.
* Audita.
* Tiene tests.

---

## TASK-075 — Implementar `CommunicationReadReceiptService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Marca comunicado como leído.
* Valida acceso.
* Idempotente.
* No duplica read receipt.
* Audita lectura si aplica.
* Tiene tests.

---

## TASK-076 — Implementar `PublicAnnouncementService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista comunicados públicos por tenant slug.
* Obtiene comunicado público por slug.
* Aplica tenant active.
* Aplica status published.
* Aplica visibility public.
* Aplica isPublicVisible true.
* Aplica expiresAt.
* Devuelve DTO public-safe.
* Tiene tests.

---

## TASK-077 — Implementar `NotificationTemplateService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crea plantillas.
* Valida code único.
* Valida subjectTemplate para email.
* Valida variablesSchema.
* Activa/desactiva.
* Archiva.
* Protege isSystem.
* Audita.
* Tiene tests.

---

## TASK-078 — Implementar `NotificationRenderingService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Renderiza subject/body.
* Valida variables.
* Rechaza variables no declaradas.
* Rechaza variables faltantes.
* Sanitiza salida.
* Minimiza contenido por canal externo.
* Tiene tests.

---

## TASK-079 — Implementar `NotificationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crea notificaciones.
* Consulta notificaciones admin.
* Consulta notificaciones propias.
* Marca notificaciones propias como leídas.
* Marca todas como leídas.
* Cancela notificaciones.
* Aplica idempotencia.
* Coordina delivery.
* Audita.
* Tiene tests.

---

## TASK-080 — Implementar `NotificationDeliveryService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Entrega in-app.
* Entrega email mock/noop.
* Crea delivery attempts.
* Actualiza sent/delivered/failed/skipped.
* Reintenta con maxAttempts.
* No duplica notificación.
* No rompe transacción principal por fallo externo.
* Tiene tests.

---

## TASK-081 — Implementar `NotificationChannelPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Determina canal habilitado.
* Aplica preferencias.
* Aplica mandatory/security override.
* Valida provider configurado.
* Bloquea canales diferidos si proveedor real no está habilitado.
* Tiene tests.

---

## TASK-082 — Implementar `NotificationPreferenceService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista preferencias propias.
* Actualiza preferencias propias.
* Upsert por category/channel.
* Bloquea mandatory/security según política.
* Audita cambios.
* Tiene tests.

---

## TASK-083 — Implementar `NotificationIdempotencyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Genera idempotencyKey.
* Detecta duplicados.
* Evita notificaciones repetidas.
* Permite retry sin duplicar Notification.
* Permite canales distintos para mismo evento.
* Tiene tests.

---

## TASK-084 — Implementar `DestinationMaskingService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Enmascara email.
* Enmascara teléfono.
* Nunca retorna destino completo.
* Rechaza destino vacío en canal externo.
* Tiene tests.

---

## TASK-085 — Implementar `CommunicationContentSanitizerService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sanitiza title.
* Sanitiza summary.
* Sanitiza body.
* Sanitiza subjectTemplate/bodyTemplate.
* Bloquea script.
* Bloquea iframe.
* Bloquea event handlers inline.
* Tiene tests.

---

## TASK-086 — Implementar `CommunicationAuditService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Audita comunicaciones.
* Audita plantillas.
* Audita notificaciones.
* Audita delivery attempts.
* Audita preferencias.
* Sanitiza metadata.
* No incluye body completo privado.
* No incluye destino completo.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-087 — Implementar casos de uso de comunicaciones admin

**Estado:** `[ ] Pending`

### Use cases

```text
CreateCommunicationUseCase
ListCommunicationsUseCase
GetCommunicationUseCase
UpdateCommunicationUseCase
PublishCommunicationUseCase
ScheduleCommunicationUseCase
CancelCommunicationUseCase
ArchiveCommunicationUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Aplican tenantId.
* Validan DTO.
* Validan estado.
* Auditan operaciones.
* Tienen tests.

---

## TASK-088 — Implementar casos de audiencia y read receipts

**Estado:** `[ ] Pending`

### Use cases

```text
UpdateCommunicationRecipientsUseCase
ListCommunicationRecipientsUseCase
ListCommunicationReadReceiptsUseCase
MarkOwnCommunicationReadUseCase
```

### Criterios de aceptación

* Validan permisos.
* Validan referencias tenant.
* Reemplazan recipients.
* Listan recipients.
* Marcan lectura idempotente.
* Tienen tests.

---

## TASK-089 — Implementar casos de comunicados propios y públicos

**Estado:** `[ ] Pending`

### Use cases

```text
ListOwnCommunicationsUseCase
GetOwnCommunicationUseCase
ListPublicAnnouncementsUseCase
GetPublicAnnouncementUseCase
```

### Criterios de aceptación

* Own valida acceso usuario-audiencia.
* Public aplica reglas WordPress.
* Public no expone privados.
* Public no expone recipients.
* Tienen tests.

---

## TASK-090 — Implementar casos de plantillas

**Estado:** `[ ] Pending`

### Use cases

```text
CreateNotificationTemplateUseCase
ListNotificationTemplatesUseCase
GetNotificationTemplateUseCase
UpdateNotificationTemplateUseCase
ActivateNotificationTemplateUseCase
DeactivateNotificationTemplateUseCase
ArchiveNotificationTemplateUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Validan schema.
* Validan duplicidad.
* Protegen isSystem.
* Auditan.
* Tienen tests.

---

## TASK-091 — Implementar casos administrativos de notificaciones

**Estado:** `[ ] Pending`

### Use cases

```text
CreateNotificationUseCase
ListNotificationsUseCase
GetNotificationUseCase
SendNotificationUseCase
RetryNotificationUseCase
CancelNotificationUseCase
ListNotificationDeliveryAttemptsUseCase
```

### Criterios de aceptación

* Requieren permisos.
* Validan destinatario tenant.
* Aplican idempotencia.
* Registran delivery attempts.
* Aplican maxAttempts.
* Auditan.
* Tienen tests.

---

## TASK-092 — Implementar casos de notificaciones propias

**Estado:** `[ ] Pending`

### Use cases

```text
ListOwnNotificationsUseCase
GetOwnNotificationUseCase
MarkOwnNotificationReadUseCase
MarkAllOwnNotificationsReadUseCase
```

### Criterios de aceptación

* Requieren permisos own.
* Solo devuelven notificaciones del usuario.
* No devuelven metadata interna.
* Mark-read idempotente.
* Tienen tests.

---

## TASK-093 — Implementar casos de preferencias propias

**Estado:** `[ ] Pending`

### Use cases

```text
GetOwnNotificationPreferencesUseCase
UpdateOwnNotificationPreferencesUseCase
PatchOwnNotificationPreferenceUseCase
```

### Criterios de aceptación

* Requieren permisos own.
* Solo afectan preferencias propias.
* Bloquean mandatory/security si aplica.
* Auditan.
* Tienen tests.

---

## TASK-094 — Implementar handler de eventos de dominio

**Estado:** `[ ] Pending`

### Use case

```text
HandleDomainEventNotificationUseCase
```

### Eventos candidatos

```text
payment.confirmed
accountStatement.published
reservation.approved
reservation.rejected
fine.issued
fine.appealAccepted
fine.appealRejected
```

### Criterios de aceptación

* Resuelve destinatarios.
* Resuelve plantilla.
* Crea notificaciones.
* Aplica idempotencia.
* No rompe transacción principal por fallo externo.
* Tiene tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-095 — Reutilizar guards base

**Estado:** `[ ] Pending`

### Guards

```text
AuthGuard
TenantGuard
TenantPermissionGuard
```

### Criterios de aceptación

* Protegen endpoints tenant.
* Protegen endpoints `/me`.
* Bloquean anonymous.
* Bloquean usuarios disabled.
* Validan tenant activo.

---

## TASK-096 — Crear `CommunicationPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/communication-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos de comunicaciones.
* Bloquea usuarios sin permiso.
* Compatible con decorators.
* Tiene tests.

---

## TASK-097 — Crear `OwnCommunicationGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/own-communication.guard.ts
```

### Criterios de aceptación

* Valida acceso del usuario al comunicado.
* Valida audiencia.
* Valida unidad/rol/persona si aplica.
* Bloquea comunicados ajenos.
* Tiene tests.

---

## TASK-098 — Crear `PublicCommunicationGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/public-communication.guard.ts
```

### Criterios de aceptación

* Valida tenant activo.
* Valida published.
* Valida public visibility.
* Valida isPublicVisible.
* Valida expiresAt.
* Bloquea privados.
* Tiene tests.

---

## TASK-099 — Crear `NotificationTemplatePermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/notification-template-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos de plantillas.
* Protege plantillas de sistema.
* Tiene tests.

---

## TASK-100 — Crear `NotificationPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/notification-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos administrativos de notificaciones.
* Bloquea usuarios sin permiso.
* Tiene tests.

---

## TASK-101 — Crear `OwnNotificationGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/own-notification.guard.ts
```

### Criterios de aceptación

* Valida recipientUserId = actorUserId.
* Bloquea notificaciones ajenas.
* Bloquea tenant B.
* Tiene tests.

---

## TASK-102 — Crear `NotificationPreferenceGuard`

**Estado:** `[ ] Pending`

### Archivo

```text
policies/notification-preference.guard.ts
```

### Criterios de aceptación

* Valida preferencia propia.
* Bloquea preferencias ajenas.
* Bloquea tenant B.
* Tiene tests.

---

## TASK-103 — Crear decorators de permisos

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text
@RequireCommunicationPermission()
@RequireOwnCommunicationPermission()
@RequireNotificationTemplatePermission()
@RequireNotificationPermission()
@RequireOwnNotificationPermission()
@RequireNotificationPreferencePermission()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-104 — Implementar `CommunicationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
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

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Aplica permisos por endpoint.
* Tiene API tests.

---

## TASK-105 — Implementar `MyCommunicationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/me/communications
GET    /api/v1/me/communications/{communicationId}
POST   /api/v1/me/communications/{communicationId}/mark-read
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa permisos own.
* Usa OwnCommunicationGuard.
* No expone comunicados ajenos.
* DTO minimizado.
* Tiene API tests.

---

## TASK-106 — Implementar `PublicAnnouncementsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

### Criterios de aceptación

* No requiere token.
* Valida tenant slug.
* Valida tenant activo.
* Valida public-safe.
* Aplica rate limit.
* Aplica cache público.
* No expone recipients.
* No expone metadata interna.
* Tiene public safety tests.

---

## TASK-107 — Implementar `NotificationTemplatesController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/tenant/notification-templates
POST   /api/v1/tenant/notification-templates
GET    /api/v1/tenant/notification-templates/{templateId}
PATCH  /api/v1/tenant/notification-templates/{templateId}
POST   /api/v1/tenant/notification-templates/{templateId}/activate
POST   /api/v1/tenant/notification-templates/{templateId}/deactivate
POST   /api/v1/tenant/notification-templates/{templateId}/archive
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Aplica permisos.
* Tiene API tests.

---

## TASK-108 — Implementar `NotificationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/tenant/notifications
POST   /api/v1/tenant/notifications
GET    /api/v1/tenant/notifications/{notificationId}
POST   /api/v1/tenant/notifications/{notificationId}/send
POST   /api/v1/tenant/notifications/{notificationId}/retry
POST   /api/v1/tenant/notifications/{notificationId}/cancel
GET    /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Aplica permisos.
* No expone secretos de proveedor.
* Tiene API tests.

---

## TASK-109 — Implementar `MyNotificationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/me/notifications
GET    /api/v1/me/notifications/{notificationId}
POST   /api/v1/me/notifications/{notificationId}/mark-read
POST   /api/v1/me/notifications/mark-all-read
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa OwnNotificationGuard.
* No expone notificaciones ajenas.
* DTO minimizado.
* Mark-read idempotente.
* Tiene API tests.

---

## TASK-110 — Implementar `NotificationPreferencesController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET   /api/v1/me/notification-preferences
PUT   /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

### Criterios de aceptación

* Usa guards.
* Solo gestiona preferencias propias.
* Bloquea categorías obligatorias según política.
* Audita cambios.
* Tiene API tests.

---

# 17. Fase 11 — Estados, idempotencia y delivery

## TASK-111 — Implementar máquina de estados de comunicaciones

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Permite `draft -> published`.
* Permite `draft -> scheduled`.
* Permite `scheduled -> published`.
* Permite `published -> archived`.
* Permite `scheduled -> cancelled`.
* Bloquea `archived -> published`.
* Bloquea `cancelled -> published`.
* Bloquea `published -> draft`.
* Tiene tests.

---

## TASK-112 — Implementar máquina de estados de notificaciones

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Permite `pending -> delivered`.
* Permite `pending -> sent`.
* Permite `sent -> delivered`.
* Permite `sent -> failed`.
* Permite `delivered -> read`.
* Permite `pending -> cancelled`.
* Bloquea `read -> delivered`.
* Bloquea `archived -> read`.
* Tiene tests.

---

## TASK-113 — Implementar idempotencia de notificaciones

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `idempotencyKey`.
* Evita duplicados por sourceType/sourceId/recipientUserId/channel.
* Repetir evento no duplica.
* Reintentos no duplican Notification.
* Canales distintos pueden crear notificaciones distintas.
* Tiene tests.

---

## TASK-114 — Implementar delivery in-app

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crea notificación `delivered`.
* Visible en `/me/notifications`.
* No requiere provider externo.
* Permite mark-read.
* Tiene tests.

---

## TASK-115 — Implementar delivery email mock/noop

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Provider mock exitoso marca sent/delivered.
* Provider mock fallido marca failed.
* Provider no configurado marca skipped o failed controlado.
* No rompe transacción principal.
* Registra deliveryAttempt.
* Enmascara destino.
* Tiene tests.

---

## TASK-116 — Implementar reintentos controlados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `maxAttempts = 3`.
* Retry incrementa attemptNumber.
* Cuarto intento falla.
* No duplica Notification.
* Audita `notification.retryScheduled`.
* Tiene tests.

---

## TASK-117 — Implementar preferencias y mandatory override

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Preferencia informativa puede desactivar email.
* Security/mandatory no se desactiva si política lo bloquea.
* Financial crítico configurable.
* ChannelPolicy aplica preferencia antes de enviar.
* Tiene tests.

---

# 18. Fase 12 — Auditoría y observabilidad

## TASK-118 — Auditar comunicaciones

**Estado:** `[ ] Pending`

### Eventos

```text
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

### Criterios de aceptación

* Eventos generados.
* Metadata sanitizada.
* Sin body completo privado.
* Sin recipients completos.
* Tiene tests.

---

## TASK-119 — Auditar plantillas

**Estado:** `[ ] Pending`

### Eventos

```text
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
```

### Criterios de aceptación

* Eventos generados.
* Metadata sanitizada.
* Sin secretos.
* Tiene tests.

---

## TASK-120 — Auditar notificaciones y delivery

**Estado:** `[ ] Pending`

### Eventos

```text
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
```

### Criterios de aceptación

* Eventos generados.
* No incluyen body completo privado.
* No incluyen email completo.
* No incluyen teléfono completo.
* No incluyen provider raw response.
* Tiene tests.

---

## TASK-121 — Auditar preferencias

**Estado:** `[ ] Pending`

### Evento

```text
notificationPreference.updated
```

### Criterios de aceptación

* Evento generado.
* Incluye category/channel/status.
* No incluye datos privados innecesarios.
* Tiene tests.

---

## TASK-122 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Logs sugeridos

```text
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

### Criterios de aceptación

* Incluyen traceId.
* No contienen tokens.
* No contienen emails completos.
* No contienen teléfonos completos.
* No contienen body privado completo.
* Tiene tests o verificación.

---

## TASK-123 — Agregar métricas

**Estado:** `[ ] Pending`

### Métricas

```text
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

### Criterios de aceptación

* Métricas incrementan.
* Labels permitidos: category, channel, status, priority, outcome, sourceType, visibility.
* No usan tenantId.
* No usan communicationId.
* No usan notificationId.
* No usan userId/personId/propertyUnitId.
* Tiene tests o verificación.

---

# 19. Fase 13 — OpenAPI

## TASK-124 — Documentar Communications administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* DTOs documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-125 — Documentar My Communications

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/me/communications` documentados.
* Own-resource documentado.
* DTO minimizado documentado.
* Errores documentados.
* OpenAPI valida.

---

## TASK-126 — Documentar Public Announcements

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints públicos documentados.
* Public-safe documentado.
* Cache headers documentados.
* No expone privados.
* OpenAPI valida.

---

## TASK-127 — Documentar Notification Templates

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* VariablesSchema documentado.
* Estados documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-128 — Documentar Notifications administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Delivery attempts documentados.
* Retry/cancel/send documentados.
* Destination masking documentado.
* Errores documentados.
* OpenAPI valida.

---

## TASK-129 — Documentar My Notifications y Preferences

**Estado:** `[ ] Pending`

### Criterios de aceptación

* My notifications documentado.
* Mark-read documentado.
* Mark-all-read documentado.
* Preferences documentado.
* Mandatory preference lock documentado.
* OpenAPI valida.

---

## TASK-130 — Validar endpoints prohibidos en OpenAPI

**Estado:** `[ ] Pending`

### OpenAPI no debe documentar

```text
GET /api/v1/public/tenants/{slug}/notifications
GET /api/v1/public/tenants/{slug}/notification-preferences
GET /api/v1/public/tenants/{slug}/communications/{id}/recipients
GET /api/v1/public/tenants/{slug}/communications/{id}/read-receipts
GET /api/v1/public/tenants/{slug}/notifications/{id}/delivery-attempts
POST /api/v1/public/tenants/{slug}/notifications
POST /api/v1/public/tenants/{slug}/communications/{id}/mark-read
```

---

# 20. Fase 14 — Pruebas

## TASK-131 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cubre todos los value objects.
* Cubre estados.
* Cubre visibilidad.
* Cubre canales.
* Cubre masking.
* Pasa en CI.

---

## TASK-132 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Communication entity.
* CommunicationRecipient entity.
* CommunicationReadReceipt entity.
* NotificationTemplate entity.
* Notification entity.
* NotificationDeliveryAttempt entity.
* NotificationPreference entity.
* Pasa en CI.

---

## TASK-133 — Implementar DTO validation tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Communication DTOs.
* Recipient DTOs.
* Public DTOs.
* Template DTOs.
* Notification DTOs.
* Preference DTOs.
* Query DTOs.
* Pasa en CI.

---

## TASK-134 — Implementar application service tests

**Estado:** `[ ] Pending`

### Servicios

```text
CommunicationService
CommunicationAudienceService
CommunicationPublicationService
CommunicationReadReceiptService
PublicAnnouncementService
NotificationTemplateService
NotificationRenderingService
NotificationService
NotificationDeliveryService
NotificationChannelPolicyService
NotificationPreferenceService
NotificationIdempotencyService
DestinationMaskingService
CommunicationAuditService
```

### Criterios de aceptación

* Caminos felices.
* Errores.
* Audiencia.
* Public-safe.
* Idempotencia.
* Preferencias.
* Delivery.
* Auditoría.
* Pasa en CI.

---

## TASK-135 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text
PrismaCommunicationRepository
PrismaCommunicationRecipientRepository
PrismaCommunicationReadReceiptRepository
PrismaNotificationTemplateRepository
PrismaNotificationRepository
PrismaNotificationDeliveryAttemptRepository
PrismaNotificationPreferenceRepository
```

### Criterios de aceptación

* Persistencia correcta.
* Filtros tenant.
* Índices/constraints validados.
* Idempotencia validada.
* Pasa en CI.

---

## TASK-136 — Implementar API tests

**Estado:** `[ ] Pending`

### Cobertura

```text
Communications admin
My Communications
Public Announcements
Notification Templates
Notifications admin
My Notifications
Notification Preferences
Delivery Attempts
```

### Criterios de aceptación

* 401/403/404/409/422.
* Filtros.
* Paginación.
* Permisos.
* DTOs.
* Auditoría.
* Pasa en CI.

---

## TASK-137 — Implementar authorization, own-resource y multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token 401.
* Sin permiso 403.
* Usuario disabled bloqueado.
* Tenant A no ve Tenant B.
* Usuario no ve notificación ajena.
* Usuario no marca ajena como leída.
* Usuario no modifica preferencia ajena.
* Pasa en CI.

---

## TASK-138 — Implementar public safety tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Solo public/published/isPublicVisible aparece.
* Draft no aparece.
* Scheduled no aparece.
* Private/internal/tenant no aparecen.
* Expired no aparece.
* Archived no aparece.
* Tenant suspended no aparece según política.
* DTO no incluye recipients.
* DTO no incluye metadata interna.
* Pasa en CI.

---

## TASK-139 — Implementar delivery, masking e idempotency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* In-app delivered.
* Email mock sent/delivered.
* Email provider failed controlado.
* Noop provider skipped/failed.
* MaxAttempts aplicado.
* destinationMasked correcto.
* No email completo.
* No teléfono completo.
* IdempotencyKey evita duplicados.
* Pasa en CI.

---

## TASK-140 — Implementar audit, observability y OpenAPI tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos auditables generados.
* Metadata sanitizada.
* Logs sin secretos.
* Métricas sin IDs sensibles.
* OpenAPI documenta endpoints requeridos.
* OpenAPI no documenta endpoints prohibidos.
* Pasa en CI.

---

# 21. Fase 15 — CI/CD y smoke tests

## TASK-141 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash
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

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.
* Integrables con CI.

---

## TASK-142 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text
lint
typecheck
unit tests
DTO validation tests
application tests
repository integration tests críticos
API tests críticos
authorization tests
own-resource tests
multitenancy tests
public safety tests
notification delivery tests
preference tests
idempotency tests
audit tests
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay comunicación cross-tenant.
* Pipeline falla si hay notificación cross-tenant.
* Pipeline falla si usuario ve notificación ajena.
* Pipeline falla si privado aparece públicamente.
* Pipeline falla si se expone recipients.
* Pipeline falla si se guarda destino completo.
* Pipeline falla si se duplica notificación.
* Pipeline falla si OpenAPI no coincide.
* Pipeline falla si build falla.

---

## TASK-143 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text
GET /api/v1/health
POST /api/v1/tenant/communications
PUT /api/v1/tenant/communications/{communicationId}/recipients
POST /api/v1/tenant/communications/{communicationId}/publish
GET /api/v1/me/communications
POST /api/v1/me/communications/{communicationId}/mark-read
GET /api/v1/public/tenants/{slug}/announcements
POST /api/v1/tenant/notification-templates
POST /api/v1/tenant/notifications
GET /api/v1/me/notifications
POST /api/v1/me/notifications/{notificationId}/mark-read
POST /api/v1/tenant/notifications/{notificationId}/send
GET /api/v1/tenant/notifications/{notificationId}/delivery-attempts
GET admin endpoint sin token
GET public notifications prohibido
```

### Criterios de aceptación

* Smoke tests pasan.
* Errores incluyen traceId.
* Endpoint público de notifications no existe.
* No requieren datos reales.
* No ejecutan proveedores reales.

---

# 22. Fase 16 — Revisión SDD

## TASK-144 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas.
* Cada endpoint tiene API tests.
* Cada permiso tiene authorization tests.
* Cada regla public-safe tiene tests.
* Cada regla own-resource tiene tests.
* Cada regla de delivery tiene tests.
* Cada regla de idempotencia tiene tests.

---

## TASK-145 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant_id obligatorio.
* RBAC y permisos.
* Observabilidad.
* Testing.
* CI gates.
* No contradice ADRs.

---

## TASK-146 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta notifications públicas.
* No documenta recipients públicos.
* No documenta preferences públicas.
* No documenta delivery attempts públicos.
* Permisos documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-147 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash
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

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay datos reales.
* No hay secretos.
* No hay endpoints fuera de alcance.

---

## TASK-148 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text
- PR link o commit SHA.
- Migración aplicada.
- Seeds demo.
- Endpoints implementados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 23. Fase 17 — Pendientes diferidos controlados

## TASK-149 — Diferir WhatsApp real

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor externo, plantillas aprobadas, costos, cumplimiento y seguridad de números telefónicos.

### Futuro

```text
docs/specs/00X-notification-providers-whatsapp/
```

---

## TASK-150 — Diferir SMS real

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor, costos, consentimiento, límites y cumplimiento.

### Futuro

```text
docs/specs/00X-notification-providers-sms/
```

---

## TASK-151 — Diferir push notifications móviles

**Estado:** `[-] Deferred`

### Razón

Depende de aplicación móvil o PWA, device tokens y reglas de privacidad.

### Futuro

```text
docs/specs/00X-push-notifications/
```

---

## TASK-152 — Diferir webhooks salientes avanzados

**Estado:** `[-] Deferred`

### Razón

Requiere firma de webhooks, retry policy, dead-letter queue y seguridad de integraciones.

### Futuro

```text
docs/specs/00X-outbound-webhooks/
```

---

## TASK-153 — Diferir n8n workflows avanzados

**Estado:** `[-] Deferred`

### Razón

Requiere diseño de conectores, credenciales, webhooks firmados y políticas de automatización.

### Futuro

```text
docs/specs/00X-n8n-automation-integration/
```

---

## TASK-154 — Diferir constructor visual de plantillas

**Estado:** `[-] Deferred`

### Razón

Requiere editor visual, sanitización avanzada y previsualización.

### Futuro

```text
docs/specs/00X-advanced-template-builder/
```

---

## TASK-155 — Diferir confirmación legal certificada

**Estado:** `[-] Deferred`

### Razón

Requiere sellado temporal, firma, trazabilidad reforzada y cumplimiento legal.

### Futuro

```text
docs/specs/00X-certified-communication-receipts/
```

---

## TASK-156 — Diferir chat bidireccional y foros

**Estado:** `[-] Deferred`

### Razón

Requiere moderación, seguridad, notificaciones en tiempo real y reglas comunitarias.

### Futuro

```text
docs/specs/00X-community-chat-forums/
```

---

## TASK-157 — Diferir IA con datos reales

**Estado:** `[-] Deferred`

### Razón

Requiere gobierno de datos, anonimización, revisión humana y autorización explícita.

### Futuro

```text
docs/specs/00X-ai-assisted-communication-drafts/
```

---

# 24. Definition of Done

El módulo `012-communications-notifications` estará terminado cuando:

```text
[ ] Documentación completa.
[ ] Módulo communications creado.
[ ] Migración creada y ejecutada.
[ ] communications implementado.
[ ] communication_recipients implementado.
[ ] communication_read_receipts implementado.
[ ] notification_templates implementado.
[ ] notifications implementado.
[ ] notification_delivery_attempts implementado.
[ ] notification_preferences implementado.
[ ] Seeds demo creados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Eventos implementados.
[ ] Errores implementados.
[ ] DTOs implementados.
[ ] Puertos implementados.
[ ] Repositorios implementados.
[ ] Adapters implementados.
[ ] Servicios implementados.
[ ] Casos de uso implementados.
[ ] Guards/policies implementados.
[ ] Controladores implementados.
[ ] Gestión administrativa de comunicados implementada.
[ ] Gestión de audiencia implementada.
[ ] Publicación implementada.
[ ] Programación básica implementada o diferida controladamente.
[ ] Cancelación implementada.
[ ] Archivo implementado.
[ ] Consulta de comunicados propios implementada.
[ ] Mark-read de comunicados implementado.
[ ] Endpoints públicos WordPress implementados.
[ ] Public-safe DTO implementado.
[ ] Gestión de plantillas implementada.
[ ] Generación de notificaciones in-app implementada.
[ ] Consulta de notificaciones propias implementada.
[ ] Mark-read de notificaciones implementado.
[ ] Delivery attempts implementados.
[ ] Email mock/noop implementado.
[ ] Destination masking implementado.
[ ] Preferencias básicas implementadas.
[ ] Idempotencia implementada.
[ ] No hay notificaciones públicas.
[ ] No se exponen recipients públicos.
[ ] No se guardan destinos completos.
[ ] Auditoría implementada.
[ ] Logs sanitizados implementados.
[ ] Métricas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] DTO tests pasan.
[ ] Entity tests pasan.
[ ] Application tests pasan.
[ ] Repository integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Public safety tests pasan.
[ ] Delivery tests pasan.
[ ] Preference tests pasan.
[ ] Idempotency tests pasan.
[ ] Audit tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Diferidos documentados.
```

---

## 25. Orden recomendado de ejecución

```text
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-012      Estructura base
3. TASK-013 a TASK-028      Value objects
4. TASK-029 a TASK-041      Entidades, eventos y errores
5. TASK-042 a TASK-054      Base de datos, Prisma y seeds
6. TASK-055 a TASK-061      DTOs
7. TASK-062 a TASK-071      Puertos, repositorios y adapters
8. TASK-072 a TASK-086      Servicios
9. TASK-087 a TASK-094      Casos de uso
10. TASK-095 a TASK-103     Guards, policies y decorators
11. TASK-104 a TASK-110     Controladores
12. TASK-111 a TASK-117     Estados, idempotencia y delivery
13. TASK-118 a TASK-123     Auditoría y observabilidad
14. TASK-124 a TASK-130     OpenAPI
15. TASK-131 a TASK-140     Pruebas
16. TASK-141 a TASK-143     CI/CD y smoke
17. TASK-144 a TASK-148     Revisión SDD
18. TASK-149 a TASK-157     Diferidos controlados
```

---

## 26. Riesgos de ejecución

| Riesgo                                       |    Impacto | Mitigación                          |
| -------------------------------------------- | ---------: | ----------------------------------- |
| Comunicación cross-tenant                    |    Crítico | tenant_id + guards + tests          |
| Notificación cross-tenant                    |    Crítico | tenant_id + recipient validation    |
| Usuario lee notificación ajena               |    Crítico | OwnNotificationGuard                |
| Comunicado privado aparece en WordPress      |    Crítico | PublicAnnouncementService + tests   |
| Endpoint público expone recipients           |       Alto | Public DTO allowlist                |
| Recipient de otro tenant                     |       Alto | AudienceService                     |
| Provider externo caído rompe flujo principal |      Medio | Adapter + queue + failure isolation |
| Notificación duplicada                       | Medio/alto | idempotencyKey                      |
| Destination completo persistido              |       Alto | DestinationMaskingService           |
| Plantilla con script injection               |       Alto | Sanitizer + template validation     |
| Preferencias bloquean mandatory              |      Medio | ChannelPolicyService                |
| Logs con contenido privado                   |       Alto | redaction + observability tests     |
| OpenAPI documenta endpoints prohibidos       |       Alto | OpenAPI negative tests              |

---

## 27. Checklist de revisión de PR

```text
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] Sigue test-plan.md.
[ ] No implementa WhatsApp real fuera de scope.
[ ] No implementa SMS real fuera de scope.
[ ] No implementa push real fuera de scope.
[ ] No implementa chat fuera de scope.
[ ] No implementa marketing automation fuera de scope.
[ ] No usa IA externa con datos reales.
[ ] Todas las tablas tenant-scoped tienen tenant_id.
[ ] Toda consulta filtra por tenant_id.
[ ] No se acepta tenantId desde body.
[ ] No se busca communication solo por id.
[ ] No se busca notification solo por id.
[ ] No se busca deliveryAttempt solo por id.
[ ] No se busca preference solo por id.
[ ] userId se valida contra tenant.
[ ] personId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] roleId se valida contra tenant.
[ ] Recipients se validan contra tenant.
[ ] Communication private no aparece públicamente.
[ ] Communication internal no aparece públicamente.
[ ] Communication tenant no aparece públicamente.
[ ] Communication draft no aparece públicamente.
[ ] Communication scheduled no aparece públicamente.
[ ] Communication archived no aparece públicamente.
[ ] Communication expired no aparece públicamente por defecto.
[ ] WordPress solo ve published/public/isPublicVisible.
[ ] Endpoint público no devuelve recipients.
[ ] Endpoint público no devuelve readReceipts.
[ ] Endpoint público no devuelve notifications.
[ ] Endpoint público no devuelve metadata interna.
[ ] No existen endpoints públicos de notifications.
[ ] No existen endpoints públicos de preferences.
[ ] No existen endpoints públicos de delivery attempts.
[ ] Usuario no ve notificación ajena.
[ ] Usuario no marca notificación ajena como leída.
[ ] Usuario no modifica preferencia ajena.
[ ] Own DTO no expone metadata interna.
[ ] Template email requiere subjectTemplate.
[ ] Template variablesSchema se valida.
[ ] Template inactiva no se usa.
[ ] Content sanitizer bloquea scripts.
[ ] Notification idempotency evita duplicados.
[ ] Retry no duplica Notification.
[ ] DeliveryAttempt usa destinationMasked.
[ ] Email completo no se persiste.
[ ] Teléfono completo no se persiste.
[ ] Provider raw response no se persiste completo.
[ ] Provider credentials no se persisten.
[ ] Preference mandatory/security no se desactiva sin política.
[ ] Fallo provider no rompe transacción principal.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen emails completos.
[ ] Logs no contienen teléfonos completos.
[ ] Logs no contienen body privado completo.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan communicationId.
[ ] Métricas no usan notificationId.
[ ] Métricas no usan userId/personId/propertyUnitId.
[ ] OpenAPI documenta endpoints requeridos.
[ ] OpenAPI no documenta endpoints prohibidos.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests public safety pasan.
[ ] Tests delivery pasan.
[ ] Tests preferences pasan.
[ ] Tests security pasan.
[ ] CI pasa.
```

---

## 28. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá un módulo funcional para gestionar comunicaciones y notificaciones de forma segura, auditable, multitenant y extensible.

El resultado esperado incluye:

```text
- comunicados administrativos;
- gestión de audiencia;
- publicación, programación, cancelación y archivo;
- comunicados propios;
- lectura idempotente de comunicados;
- comunicados públicos seguros para WordPress;
- plantillas básicas de notificación;
- notificaciones in-app;
- consulta de notificaciones propias;
- lectura idempotente de notificaciones;
- delivery attempts;
- email adapter mock/noop;
- destination masking;
- preferencias básicas;
- idempotencia por evento;
- auditoría;
- observabilidad segura;
- OpenAPI actualizado;
- pruebas completas;
- CI passing.
```

La implementación no debe aceptarse si:

```text
permite comunicaciones cross-tenant
permite notificaciones cross-tenant
permite recipients de otro tenant
expone comunicados privados en WordPress
expone notificaciones públicamente
permite leer notificaciones ajenas
permite marcar notificaciones ajenas como leídas
permite modificar preferencias ajenas
guarda emails completos en delivery attempts
guarda teléfonos completos en delivery attempts
guarda secretos de proveedor
duplica notificaciones por evento
omite idempotencia
omite auditoría
omite tenant_id
busca recursos solo por id sin tenant_id
documenta endpoints públicos prohibidos
```

Antes de cerrar el paquete documental de `012-communications-notifications`, debe completarse:

```text
docs/specs/012-communications-notifications/security-notes.md
```
