# Tasks — Spec 001 Tenants Management

## 1. Información del documento

| Campo           | Valor                                    |
| --------------- | ---------------------------------------- |
| Proyecto        | RESIDENT Core                            |
| Spec ID         | 001                                      |
| Módulo          | Tenants Management                       |
| Documento       | Implementation Tasks                     |
| Ruta            | `docs/specs/001-tenants/tasks.md`        |
| Versión         | 0.1                                      |
| Estado          | needs-review                             |
| Fecha           | 2026-07-13                               |
| Documento base  | `docs/specs/001-tenants/spec.md`         |
| Plan técnico    | `docs/specs/001-tenants/plan.md`         |
| Modelo de datos | `docs/specs/001-tenants/data-model.md`   |
| Contrato API    | `docs/specs/001-tenants/api-contract.md` |
| Plan de pruebas | `docs/specs/001-tenants/test-plan.md`    |

---

## 2. Propósito

Este documento convierte la spec `001-tenants` en una lista ejecutable de tareas.

Debe ser usado para implementar el módulo `Tenants Management` siguiendo SDD.

Cada tarea debe tener:

* identificador;
* descripción;
* archivos esperados;
* dependencias;
* criterios de aceptación;
* pruebas asociadas;
* estado.

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

---

## 4. Reglas de ejecución

Antes de implementar código, se deben cumplir estas reglas:

```text
1. Leer spec.md.
2. Leer plan.md.
3. Leer data-model.md.
4. Leer api-contract.md.
5. Leer test-plan.md.
6. No modificar decisiones ADR sin crear o actualizar un ADR.
7. No implementar fuera del alcance de la spec.
8. No crear microservicio separado.
9. No implementar usuarios/roles completos en esta spec.
10. No implementar pagos, alícuotas, residentes ni propiedades.
11. No eliminar tenants físicamente.
12. No exponer datos internos en endpoints públicos.
13. No omitir auditoría en operaciones críticas.
14. No omitir pruebas de autorización y multitenancy.
```

---

## 5. Resumen de entregables

Al finalizar esta spec deben existir:

```text
docs/specs/001-tenants/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en el backend:

```text
apps/api/src/modules/tenants/
├── tenants.module.ts
├── platform-tenants.controller.ts
├── tenants.controller.ts
├── public-tenants.controller.ts
├── application/
├── domain/
├── infrastructure/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Descripción

Crear la carpeta documental:

```text
docs/specs/001-tenants/
```

### Criterios de aceptación

* La carpeta existe.
* La carpeta contiene documentos base de la spec.

### Pruebas asociadas

No aplica.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/spec.md
```

### Descripción

Guardar la especificación funcional del módulo.

### Criterios de aceptación

* El archivo existe.
* Define alcance.
* Define actores.
* Define reglas de negocio.
* Define historias de usuario.
* Define requisitos funcionales y no funcionales.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/plan.md
```

### Descripción

Guardar el plan técnico de implementación.

### Criterios de aceptación

* El archivo existe.
* Define estructura de carpetas.
* Define entidades.
* Define casos de uso.
* Define repositorios.
* Define controladores.
* Define integración WordPress.
* Define auditoría.
* Define eventos.
* Define orden de implementación.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/data-model.md
```

### Criterios de aceptación

* El archivo existe.
* Define tablas.
* Define columnas.
* Define constraints.
* Define índices.
* Define enum `TenantStatus`.
* Define modelo Prisma propuesto.
* Define reglas de migración.
* Define seeds.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/api-contract.md
```

### Criterios de aceptación

* El archivo existe.
* Define endpoints.
* Define requests.
* Define responses.
* Define errores.
* Define permisos.
* Define auditoría por endpoint.
* Define contrato público para WordPress.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/test-plan.md
```

### Criterios de aceptación

* El archivo existe.
* Define unit tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define multitenancy tests.
* Define security tests.
* Define contract tests.
* Define migration tests.
* Define smoke tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/tasks.md
```

### Criterios de aceptación

* El archivo existe.
* Las tareas están ordenadas por fases.
* Las tareas son ejecutables.
* Cada tarea tiene criterios de aceptación.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text
docs/specs/001-tenants/security-notes.md
```

### Descripción

Crear notas específicas de seguridad para el módulo.

### Criterios de aceptación

* El archivo existe.
* Identifica amenazas.
* Define controles.
* Define datos públicos y no públicos.
* Define riesgos de WordPress.
* Define pruebas de seguridad mínimas.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `tenants`

**Estado:** `[ ] Pending`

### Archivos esperados

```text
apps/api/src/modules/tenants/tenants.module.ts
```

### Descripción

Crear el módulo NestJS para `Tenants Management`.

### Criterios de aceptación

* El módulo compila.
* El módulo puede ser importado en `AppModule`.
* El módulo no depende de módulos futuros no implementados.
* El módulo expone providers necesarios.

### Pruebas asociadas

* Build de NestJS.
* Typecheck.

---

## TASK-010 — Crear estructura de carpetas del módulo

**Estado:** `[ ] Pending`

### Estructura esperada

```text
apps/api/src/modules/tenants/
├── application/
├── domain/
├── infrastructure/
├── dto/
└── tests/
```

### Criterios de aceptación

* La estructura respeta `plan.md`.
* No se mezclan controladores con lógica de dominio.
* No se usa Prisma directamente desde controladores.

---

## TASK-011 — Crear controladores base vacíos

**Estado:** `[ ] Pending`

### Archivos esperados

```text
apps/api/src/modules/tenants/platform-tenants.controller.ts
apps/api/src/modules/tenants/tenants.controller.ts
apps/api/src/modules/tenants/public-tenants.controller.ts
```

### Criterios de aceptación

* Los controladores compilan.
* No contienen lógica de negocio.
* Tienen rutas base correctas.
* Están registrados en `TenantsModule`.

### Rutas base

```text
/api/v1/platform/tenants
/api/v1/tenant
/api/v1/public/tenants
```

---

# 8. Fase 2 — Dominio

## TASK-012 — Crear value object `TenantSlug`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/value-objects/tenant-slug.vo.ts
```

### Descripción

Implementar normalización y validación de slug.

### Reglas

* minúsculas;
* sin tildes;
* sin espacios;
* guiones medios;
* regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`;
* longitud mínima 3;
* longitud máxima 80;
* no reservado.

### Criterios de aceptación

* Normaliza nombres.
* Rechaza slugs inválidos.
* Rechaza reservados.
* Tiene unit tests.

### Pruebas asociadas

```text
UT-SLUG-001 a UT-SLUG-012
```

---

## TASK-013 — Crear value object `TenantStatus`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/value-objects/tenant-status.vo.ts
```

### Estados

```text
pendingSetup
active
suspended
inactive
archived
```

### Criterios de aceptación

* Valida transiciones permitidas.
* Rechaza transiciones inválidas.
* Expone `canOperate()`.
* Tiene unit tests.

### Pruebas asociadas

```text
UT-STATUS-001 a UT-STATUS-012
```

---

## TASK-014 — Crear value object `TenantCurrency`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/value-objects/tenant-currency.vo.ts
```

### Regla MVP

```text
Solo USD.
```

### Criterios de aceptación

* Acepta `USD`.
* Rechaza moneda vacía.
* Rechaza monedas no permitidas.
* Tiene unit tests.

---

## TASK-015 — Crear value object `TenantTimezone`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/value-objects/tenant-timezone.vo.ts
```

### Default

```text
America/Guayaquil
```

### Criterios de aceptación

* Acepta `America/Guayaquil`.
* Rechaza timezones inválidas.
* Define default.
* Tiene unit tests.

---

## TASK-016 — Crear value object `TenantColor`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/value-objects/tenant-color.vo.ts
```

### Regex

```text
^#[0-9A-Fa-f]{6}$
```

### Criterios de aceptación

* Acepta colores válidos.
* Rechaza colores inválidos.
* Permite null si el campo es opcional.
* Tiene unit tests.

---

## TASK-017 — Crear entidad `Tenant`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/domain/entities/tenant.entity.ts
```

### Métodos esperados

```text
activate()
suspend(reason, actorId)
reactivate(actorId)
archive(actorId)
isActive()
isSuspended()
isArchived()
canOperate()
```

### Criterios de aceptación

* Controla estado.
* No permite transición inválida.
* Requiere motivo para suspensión.
* No elimina datos.
* Tiene unit tests.

---

## TASK-018 — Crear entidades secundarias

**Estado:** `[ ] Pending`

### Archivos

```text
tenant-profile.entity.ts
tenant-branding.entity.ts
tenant-configuration.entity.ts
tenant-wordpress-mapping.entity.ts
```

### Criterios de aceptación

* Representan datos según `data-model.md`.
* No incluyen lógica de persistencia.
* Validan reglas básicas si corresponde.

---

## TASK-019 — Crear errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text
tenant-not-found.error.ts
tenant-slug-already-exists.error.ts
tenant-invalid-status.error.ts
tenant-invalid-slug.error.ts
tenant-suspended.error.ts
tenant-archived.error.ts
tenant-status-transition-invalid.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error puede mapearse a HTTP status.
* No expone detalles internos.

---

## TASK-020 — Crear eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text
tenant-created.event.ts
tenant-activated.event.ts
tenant-suspended.event.ts
tenant-reactivated.event.ts
tenant-archived.event.ts
tenant-profile-updated.event.ts
tenant-branding-updated.event.ts
tenant-configuration-updated.event.ts
tenant-wordpress-mapping-updated.event.ts
tenant-base-roles-created.event.ts
```

### Criterios de aceptación

* Los eventos tienen nombre estable.
* Incluyen `tenantId`.
* Incluyen `actorUserId` cuando aplique.
* Incluyen `traceId`.
* No incluyen datos sensibles innecesarios.

---

# 9. Fase 3 — DTOs y validación

## TASK-021 — Crear `CreateTenantDto`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/dto/create-tenant.dto.ts
```

### Campos

```text
name
legalName
slug
timezone
currency
profile
branding
wordpressMapping
```

### Criterios de aceptación

* Valida `name`.
* Valida `slug`.
* Valida `timezone`.
* Valida `currency`.
* Valida objetos anidados.
* Rechaza payload inválido.

---

## TASK-022 — Crear `UpdateTenantDto`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/dto/update-tenant.dto.ts
```

### Campos permitidos

```text
name
legalName
timezone
currency
planCode
```

### Criterios de aceptación

* No permite modificar `status`.
* No permite modificar campos de suspensión o archivado.
* Valida campos opcionales.

---

## TASK-023 — Crear `SuspendTenantDto`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/dto/suspend-tenant.dto.ts
```

### Campos

```text
reason
```

### Criterios de aceptación

* `reason` requerido.
* No acepta string vacío.
* Longitud máxima definida.

---

## TASK-024 — Crear DTOs de profile, branding, configuration y WordPress mapping

**Estado:** `[ ] Pending`

### Archivos

```text
update-tenant-profile.dto.ts
update-tenant-branding.dto.ts
update-tenant-configuration.dto.ts
update-wordpress-mapping.dto.ts
```

### Criterios de aceptación

* Validan email.
* Validan URL.
* Validan colores.
* Validan timezone.
* Validan currency.
* Validan flags.
* Rechazan payloads inválidos.

---

## TASK-025 — Crear DTOs de respuesta

**Estado:** `[ ] Pending`

### Archivos

```text
tenant-response.dto.ts
tenant-summary.dto.ts
tenant-detail.dto.ts
public-tenant-profile-response.dto.ts
list-tenants-query.dto.ts
```

### Criterios de aceptación

* Separan respuesta pública de respuesta interna.
* No exponen campos prohibidos en DTO público.
* Incluyen campos definidos en `api-contract.md`.

---

# 10. Fase 4 — Prisma y migración

## TASK-026 — Agregar enum `TenantStatus` a Prisma

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/prisma/schema.prisma
```

### Criterios de aceptación

* Enum creado.
* Usa valores mapeados según `data-model.md`.
* Prisma Client genera sin errores.

---

## TASK-027 — Agregar modelo Prisma `Tenant`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/prisma/schema.prisma
```

### Criterios de aceptación

* Modelo `Tenant` creado.
* `slug` unique.
* Índices definidos.
* Defaults correctos.
* `onDelete: Restrict` en relaciones secundarias.

---

## TASK-028 — Agregar modelos Prisma secundarios

**Estado:** `[ ] Pending`

### Modelos

```text
TenantProfile
TenantBranding
TenantConfiguration
TenantWordPressMapping
```

### Criterios de aceptación

* Relaciones 1:1 con Tenant.
* `tenantId` unique.
* Nombres físicos con `@@map`.
* Columnas con `@map` cuando corresponda.
* Índices definidos.

---

## TASK-029 — Crear migración `001_create_tenants`

**Estado:** `[ ] Pending`

### Comando esperado

```bash
npm run prisma:migrate:dev -- --name 001_create_tenants
```

### Criterios de aceptación

* La migración se genera.
* El SQL es revisado.
* No incluye cascade delete peligroso.
* Crea enum, tablas, constraints e índices.
* Aplica correctamente en local.

---

## TASK-030 — Crear mapper Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/infrastructure/persistence/tenant.mapper.ts
```

### Criterios de aceptación

* Convierte modelos Prisma a entidades/dtos.
* No expone campos internos en DTO público.
* Maneja relaciones opcionales.

---

## TASK-031 — Crear repositorio Prisma

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/infrastructure/persistence/prisma-tenant.repository.ts
```

### Métodos

```text
create()
findById()
findBySlug()
findBySlugForPublicProfile()
list()
update()
existsBySlug()
activate()
suspend()
reactivate()
archive()
```

### Criterios de aceptación

* No se llama Prisma desde controladores.
* Maneja unique constraint.
* Usa transacciones donde corresponde.
* Respeta no eliminación física.
* Tiene integration tests.

---

## TASK-032 — Crear seeds demo de tenants

**Estado:** `[ ] Pending`

### Archivo sugerido

```text
apps/api/prisma/seed.ts
```

### Tenants demo

```text
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
tenant-suspendido-demo
tenant-archivado-demo
```

### Criterios de aceptación

* Seeds no usan datos reales.
* Seeds son idempotentes o controlados.
* Tenants demo tienen profile/configuration.
* Tenant suspendido tiene motivo.

---

# 11. Fase 5 — Puertos y adaptadores transversales

## TASK-033 — Crear puerto `TenantAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/ports/tenant-audit.port.ts
```

### Criterios de aceptación

* Define método para registrar auditoría.
* Incluye `tenantId`, `actorUserId`, `action`, `resourceId`, `traceId`.
* No acopla a implementación final de auditoría.

---

## TASK-034 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/infrastructure/audit/tenant-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `TenantAuditPort`.
* Puede registrar en logger o puerto genérico temporal.
* No bloquea implementación futura de `007-audit`.
* Es testeable.

---

## TASK-035 — Crear puerto `TenantEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/ports/tenant-events.port.ts
```

### Criterios de aceptación

* Define método `publish(event)`.
* No depende de broker externo.
* Permite implementación futura con outbox/event bus.

---

## TASK-036 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/infrastructure/events/tenant-events.adapter.ts
```

### Criterios de aceptación

* Implementa `TenantEventsPort`.
* Registra o publica eventos internamente.
* No invoca n8n directamente.
* Es reemplazable.

---

## TASK-037 — Crear puerto `TenantBaseRolesPort`

**Estado:** `[ ] Pending`

### Archivo sugerido

```text
apps/api/src/modules/tenants/application/ports/tenant-base-roles.port.ts
```

### Descripción

Crear puerto temporal para creación de roles base sin invadir `002-users-roles`.

### Criterios de aceptación

* Define `createBaseRolesForTenant(tenantId, actorUserId, traceId)`.
* La implementación puede ser placeholder.
* Registra evento o auditoría.
* No crea tablas de roles todavía.

---

# 12. Fase 6 — Servicios de aplicación

## TASK-038 — Crear `TenantOnboardingService`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/services/tenant-onboarding.service.ts
```

### Responsabilidad

Orquestar configuración inicial del tenant.

### Criterios de aceptación

* Crea profile.
* Crea branding.
* Crea configuration.
* Crea WordPress mapping si aplica.
* Invoca `TenantBaseRolesPort`.
* No implementa usuarios reales.

---

## TASK-039 — Crear `TenantStatusService`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/services/tenant-status.service.ts
```

### Responsabilidad

Centralizar reglas de transición de estado.

### Criterios de aceptación

* Valida activación.
* Valida suspensión.
* Valida reactivación.
* Valida archivado.
* Valida operación permitida.
* Tiene unit tests.

---

## TASK-040 — Crear `TenantPublicProfileService`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/services/tenant-public-profile.service.ts
```

### Responsabilidad

Construir respuesta pública segura.

### Criterios de aceptación

* No devuelve campos internos.
* Solo expone tenants activos.
* Devuelve `accessUrl`.
* Cumple contrato WordPress.

---

# 13. Fase 7 — Casos de uso

## TASK-041 — Implementar `CreateTenantUseCase`

**Estado:** `[ ] Pending`

### Archivo

```text
apps/api/src/modules/tenants/application/use-cases/create-tenant.use-case.ts
```

### Criterios de aceptación

* Valida permiso vía controller/guard.
* Normaliza slug.
* Valida unicidad.
* Crea tenant en transacción.
* Crea entidades secundarias.
* Invoca roles base port.
* Registra auditoría.
* Emite eventos.
* Devuelve `TenantDetailDto`.
* Tiene tests.

### Pruebas

```text
APP-CREATE-001 a APP-CREATE-012
API-CREATE-001 a API-CREATE-014
```

---

## TASK-042 — Implementar `ListTenantsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Soporta paginación.
* Soporta filtro `status`.
* Soporta `search`.
* Soporta ordenamiento permitido.
* Devuelve meta.
* No expone relaciones innecesarias.

---

## TASK-043 — Implementar `GetTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Busca por ID.
* Devuelve detalle.
* Retorna `TENANT_NOT_FOUND` si no existe.
* Requiere permiso platform.

---

## TASK-044 — Implementar `UpdateTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Actualiza solo campos permitidos.
* No cambia `status`.
* Valida timezone y currency.
* Registra auditoría.
* Devuelve tenant actualizado.

---

## TASK-045 — Implementar `ActivateTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida transición.
* Valida requisitos mínimos.
* Considera placeholder de roles base.
* Registra auditoría.
* Emite `TenantActivated`.
* Devuelve status `active`.

---

## TASK-046 — Implementar `SuspendTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Requiere motivo.
* Valida transición.
* Setea `suspendedAt`, `suspendedBy`, `suspensionReason`.
* Registra auditoría.
* Emite `TenantSuspended`.
* Bloquea operación ordinaria futura.

---

## TASK-047 — Implementar `ReactivateTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Permite reactivar `suspended` o `inactive`.
* Rechaza `active`.
* Rechaza `archived`.
* Limpia o conserva campos de suspensión según decisión documentada.
* Registra auditoría.
* Emite evento.

---

## TASK-048 — Implementar `ArchiveTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No elimina físicamente.
* Setea `archivedAt`, `archivedBy`.
* Cambia status a `archived`.
* Registra auditoría.
* Emite evento.
* Rechaza transiciones inválidas.

---

## TASK-049 — Implementar `GetPublicTenantProfileUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Busca por slug.
* Valida slug.
* Solo expone tenants `active`.
* Devuelve DTO público.
* No expone ID interno ni configuración.
* Tiene contract tests.

---

## TASK-050 — Implementar use cases de profile, branding, configuration y WordPress mapping

**Estado:** `[ ] Pending`

### Use cases

```text
UpdateTenantProfileUseCase
UpdateTenantBrandingUseCase
UpdateTenantConfigurationUseCase
UpdateWordPressMappingUseCase
```

### Criterios de aceptación

* Operan solo sobre tenant activo.
* Validan permisos tenant-scoped.
* Registran auditoría.
* Emiten eventos.
* Validan DTOs.
* No afectan otros tenants.

---

# 14. Fase 8 — Autenticación y autorización

## TASK-051 — Integrar `AuthGuard`

**Estado:** `[ ] Pending`

### Descripción

Proteger endpoints privados.

### Criterios de aceptación

* Sin token retorna 401.
* Token inválido retorna 401.
* Endpoint público no requiere token.
* Compatible con auth propia temporal y Keycloak futuro.

---

## TASK-052 — Integrar `PlatformPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos `platform.tenants.*`.
* Rechaza TenantAdmin en endpoints platform.
* Retorna 403 si no hay permiso.
* Tiene authorization tests.

---

## TASK-053 — Integrar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida membresía futura o mock temporal.
* Rechaza usuario sin tenant.
* Rechaza tenant suspendido según política.
* No confía solo en header.

---

## TASK-054 — Integrar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos `tenants.*`.
* Aplica al tenant activo.
* Rechaza usuarios sin permiso.
* Rechaza usuarios de otro tenant.
* Tiene tests multitenant.

---

## TASK-055 — Crear decorators de permisos

**Estado:** `[ ] Pending`

### Decorators esperados

```text
@RequirePermission()
@RequirePlatformPermission()
@RequireTenantPermission()
```

### Criterios de aceptación

* Permiten documentar permisos por endpoint.
* Son compatibles con OpenAPI o metadata.
* No contienen lógica de negocio.

---

# 15. Fase 9 — Controladores y endpoints

## TASK-056 — Implementar `PlatformTenantsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/platform/tenants
POST   /api/v1/platform/tenants
GET    /api/v1/platform/tenants/:tenantId
PATCH  /api/v1/platform/tenants/:tenantId
POST   /api/v1/platform/tenants/:tenantId/activate
POST   /api/v1/platform/tenants/:tenantId/suspend
POST   /api/v1/platform/tenants/:tenantId/reactivate
POST   /api/v1/platform/tenants/:tenantId/archive
```

### Criterios de aceptación

* Usa use cases.
* No usa Prisma directamente.
* Tiene guards.
* Tiene DTO validation.
* Tiene OpenAPI.
* Tiene tests API.

---

## TASK-057 — Implementar `TenantsController`

**Estado:** `[ ] Pending`

### Endpoints

```text
GET    /api/v1/tenant/profile
PATCH  /api/v1/tenant/profile
GET    /api/v1/tenant/branding
PATCH  /api/v1/tenant/branding
GET    /api/v1/tenant/configuration
PATCH  /api/v1/tenant/configuration
PATCH  /api/v1/tenant/wordpress-mapping
```

### Criterios de aceptación

* Usa tenant activo.
* Valida permisos tenant-scoped.
* No permite operar tenant ajeno.
* Registra auditoría en cambios.
* Tiene tests API/autorización/multitenant.

---

## TASK-058 — Implementar `PublicTenantsController`

**Estado:** `[ ] Pending`

### Endpoint

```text
GET /api/v1/public/tenants/:slug
```

### Criterios de aceptación

* No requiere auth.
* Valida slug.
* Solo expone tenants active.
* Devuelve DTO público.
* No expone campos prohibidos.
* Tiene rate limiting o hook preparado.
* Tiene contract test WordPress.

---

# 16. Fase 10 — Errores y respuestas estándar

## TASK-059 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `TENANT_NOT_FOUND` → 404.
* `TENANT_SLUG_ALREADY_EXISTS` → 409.
* `TENANT_INVALID_SLUG` → 422.
* `TENANT_STATUS_TRANSITION_INVALID` → 409.
* `TENANT_INVALID_TIMEZONE` → 422.
* `TENANT_INVALID_CURRENCY` → 422.
* `TENANT_INVALID_COLOR` → 422.
* `TENANT_INVALID_URL` → 422.
* `FORBIDDEN` → 403.
* `UNAUTHORIZED` → 401.

---

## TASK-060 — Implementar formato estándar de error

**Estado:** `[ ] Pending`

### Formato

```json
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "The requested tenant was not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.

---

## TASK-061 — Implementar formato estándar de respuesta

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Respuestas usan `data`.
* Respuestas incluyen `meta.traceId`.
* Listas incluyen paginación.
* No retornan entidades internas directamente.

---

# 17. Fase 11 — OpenAPI

## TASK-062 — Documentar Platform API en OpenAPI

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Todos los endpoints platform documentados.
* Requests documentados.
* Responses documentados.
* Errores documentados.
* Permisos documentados.
* Tags correctos.

---

## TASK-063 — Documentar Active Tenant API en OpenAPI

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/api/v1/tenant/*` documentados.
* Permisos tenant-scoped documentados.
* Errores documentados.

---

## TASK-064 — Documentar Public API en OpenAPI

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint público documentado.
* Marcado como público.
* Marcado con rate limit.
* Contrato compatible con WordPress.
* Campos prohibidos ausentes.

---

## TASK-065 — Agregar extensiones OpenAPI de permisos

**Estado:** `[ ] Pending`

### Ejemplo

```yaml
x-required-permission: platform.tenants.create
x-audit-event: tenant.created
x-tenant-scope: platform
```

### Criterios de aceptación

* Cada endpoint privado tiene permiso documentado.
* Cada endpoint auditable tiene evento documentado.
* Endpoint público tiene `x-public: true`.

---

# 18. Fase 12 — Pruebas unitarias

## TASK-066 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text
tenant-slug.vo.spec.ts
tenant-status.vo.spec.ts
tenant-currency.vo.spec.ts
tenant-timezone.vo.spec.ts
tenant-color.vo.spec.ts
```

### Criterios de aceptación

* Cubren todos los casos `UT-*`.
* Pasan en CI.

---

## TASK-067 — Implementar unit tests de entidad Tenant

**Estado:** `[ ] Pending`

### Archivo

```text
tenant.entity.spec.ts
```

### Criterios de aceptación

* Cubre activación.
* Cubre suspensión.
* Cubre reactivación.
* Cubre archivado.
* Cubre `canOperate`.
* Cubre transiciones inválidas.

---

# 19. Fase 13 — Pruebas de aplicación

## TASK-068 — Implementar tests de `CreateTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cubre creación mínima.
* Cubre slug generado.
* Cubre slug duplicado.
* Cubre auditoría.
* Cubre evento.
* Cubre roles base port.

---

## TASK-069 — Implementar tests de estado

**Estado:** `[ ] Pending`

### Use cases

```text
ActivateTenantUseCase
SuspendTenantUseCase
ReactivateTenantUseCase
ArchiveTenantUseCase
```

### Criterios de aceptación

* Cubre caminos válidos.
* Cubre transiciones inválidas.
* Cubre auditoría.
* Cubre eventos.

---

## TASK-070 — Implementar tests de perfil público

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Solo active visible.
* Suspended/archived no visibles.
* DTO público no expone campos internos.
* Access URL correcto.

---

# 20. Fase 14 — Pruebas de integración

## TASK-071 — Implementar tests de migración

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tablas creadas.
* Enum creado.
* Índices creados.
* Unique constraints creadas.
* `onDelete Restrict` validado.
* Defaults validados.

---

## TASK-072 — Implementar tests de repositorio Prisma

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `create` funciona.
* `findById` funciona.
* `findBySlug` funciona.
* `list` pagina.
* filtros funcionan.
* `suspend` persiste campos.
* `archive` no elimina.

---

## TASK-073 — Implementar tests de transacción de creación

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Creación exitosa persiste todo.
* Error en relación secundaria hace rollback.
* Slug duplicado no deja registros parciales.

---

# 21. Fase 15 — Pruebas API

## TASK-074 — Implementar tests API de Platform Tenants

**Estado:** `[ ] Pending`

### Archivo

```text
platform-tenants.api.spec.ts
```

### Criterios de aceptación

* Cubre listar.
* Cubre crear.
* Cubre consultar.
* Cubre actualizar.
* Cubre activar.
* Cubre suspender.
* Cubre reactivar.
* Cubre archivar.
* Cubre errores.

---

## TASK-075 — Implementar tests API de Active Tenant

**Estado:** `[ ] Pending`

### Archivo

```text
tenant-active.api.spec.ts
```

### Criterios de aceptación

* Cubre profile.
* Cubre branding.
* Cubre configuration.
* Cubre WordPress mapping.
* Cubre permisos.

---

## TASK-076 — Implementar tests API de Public Tenants

**Estado:** `[ ] Pending`

### Archivo

```text
public-tenants.api.spec.ts
```

### Criterios de aceptación

* Slug active devuelve 200.
* Slug inexistente devuelve 404.
* Slug inválido devuelve 422.
* Suspended/archived devuelven 404.
* No requiere token.
* No expone campos internos.

---

# 22. Fase 16 — Pruebas de autorización y multitenancy

## TASK-077 — Implementar authorization tests de Platform API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* PlatformAdmin autorizado pasa.
* Usuario sin permiso falla.
* TenantAdmin falla en endpoints platform.
* Anonymous falla con 401.
* PlatformSupport read-only no puede suspender.

---

## TASK-078 — Implementar authorization tests de Tenant API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* TenantAdmin A opera tenant A.
* TenantAdmin A no opera tenant B.
* Usuario sin permiso falla.
* Usuario sin tenant activo falla.
* Token válido sin membership falla.

---

## TASK-079 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Profile A no afecta B.
* Branding A no afecta B.
* Configuration A no afecta B.
* WordPress mapping A no afecta B.
* Auditoría registra tenant correcto.

---

# 23. Fase 17 — Pruebas de seguridad y contrato

## TASK-080 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Payload excesivo falla.
* Strings largos fallan.
* Script input no se ejecuta.
* SQL-like input no inyecta.
* Campos desconocidos se manejan según política.

---

## TASK-081 — Implementar security tests del endpoint público

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No expone datos internos.
* No expone tenants no activos.
* Rate limit preparado o aplicado.
* CORS validado.
* No revela stack trace.

---

## TASK-082 — Implementar tests de URL segura

**Estado:** `[ ] Pending`

### Criterios de aceptación

* HTTPS aceptado.
* HTTP rechazado en producción.
* `javascript:` rechazado.
* `file:` rechazado.
* localhost rechazado en producción.

---

## TASK-083 — Implementar contract test para WordPress

**Estado:** `[ ] Pending`

### Archivo

```text
public-tenant-profile.wordpress.contract.spec.ts
```

### Criterios de aceptación

* Contrato público contiene campos requeridos.
* No contiene campos prohibidos.
* `accessUrl` válido.
* Colores válidos.
* CORS para WordPress.
* Error 404 estándar para slug inexistente.

---

# 24. Fase 18 — Observabilidad

## TASK-084 — Agregar logs estructurados del módulo

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen `traceId`.
* Logs incluyen `tenantId` cuando aplica.
* Logs incluyen `actorUserId` cuando aplica.
* No registran tokens.
* No registran payloads sensibles completos.

---

## TASK-085 — Agregar métricas básicas

**Estado:** `[ ] Pending`

### Métricas

```text
tenants_created_total
tenants_activated_total
tenants_suspended_total
tenants_reactivated_total
tenants_archived_total
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

### Criterios de aceptación

* Métricas incrementan en operaciones esperadas.
* No usan labels de alta cardinalidad innecesaria.

---

## TASK-086 — Propagar `traceId`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Requests exitosos incluyen traceId.
* Errores incluyen traceId.
* Auditoría incluye traceId.
* Eventos incluyen traceId.

---

# 25. Fase 19 — CI/CD

## TASK-087 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Comandos sugeridos

```bash
npm run test:tenants
npm run test:tenants:unit
npm run test:tenants:integration
npm run test:tenants:api
npm run test:tenants:authorization
npm run test:tenants:multitenancy
npm run test:tenants:security
npm run test:tenants:contract
```

### Criterios de aceptación

* Los comandos existen o hay equivalentes.
* Se documentan en package scripts.
* Corren localmente.

---

## TASK-088 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### Criterios de aceptación

CI ejecuta:

```text
lint
typecheck
unit tests
integration tests
API tests
authorization tests
multitenancy tests
OpenAPI validation
build
```

---

## TASK-089 — Agregar smoke tests del módulo

**Estado:** `[ ] Pending`

### Smoke tests

```text
GET /api/v1/health
GET /api/v1/public/tenants/villa-club-demo
GET /api/v1/public/tenants/no-existe
GET /api/v1/platform/tenants sin token
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No ejecutan operaciones destructivas.

---

# 26. Fase 20 — Revisión SDD

## TASK-090 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene pruebas API.
* Cada operación crítica tiene auditoría.
* Cada endpoint privado tiene authorization tests.
* Endpoint público tiene contract tests.

---

## TASK-091 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs a verificar

```text
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-008 API Gateway Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* No contradice estrategia multitenant.
* No omite autorización.
* No omite auditoría.
* No expone datos sensibles.
* No usa WordPress como fuente de verdad.

---

## TASK-092 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato generado coincide con `api-contract.md`.
* Endpoints privados tienen auth.
* Endpoint público no tiene auth.
* Permisos están documentados.
* Errores están documentados.

---

## TASK-093 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run openapi:validate
npm run build
```

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay warnings críticos.

---

## TASK-094 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text
- PR link o commit SHA.
- Tests ejecutados.
- Migración aplicada.
- OpenAPI actualizado.
- Captura o salida de smoke tests.
- Riesgos pendientes.
- Pendientes diferidos.
```

---

# 27. Fase 21 — Pendientes diferidos controlados

## TASK-095 — Diferir integración real de Keycloak

**Estado:** `[-] Deferred`

### Razón

La integración real de Keycloak corresponde a identidad y autenticación, no al núcleo del módulo tenants.

### Se implementará en

```text
002-users-roles
identity integration task
```

---

## TASK-096 — Diferir invitación real de TenantAdmin

**Estado:** `[-] Deferred`

### Razón

Requiere usuarios, membresías, invitaciones y correo.

### Se implementará en

```text
docs/specs/002-users-roles/
```

---

## TASK-097 — Diferir persistencia real de roles base

**Estado:** `[-] Deferred`

### Razón

La matriz real de roles/permisos corresponde a `002-users-roles`.

### Implementación temporal

```text
TenantBaseRolesPort placeholder
```

---

## TASK-098 — Diferir sincronización avanzada WordPress

**Estado:** `[-] Deferred`

### Razón

Esta spec solo define endpoint público y mapping básico.

### Se implementará en

```text
docs/specs/008-wordpress-integration/
```

---

## TASK-099 — Diferir dominios personalizados por tenant

**Estado:** `[-] Deferred`

### Razón

No es necesario para MVP.

### Se implementará mediante ADR/spec futura si se justifica.

---

# 28. Definition of Done del módulo

El módulo `001-tenants` estará terminado cuando:

```text
[ ] Documentación spec completa.
[ ] Modelo Prisma implementado.
[ ] Migración creada y validada.
[ ] Seeds demo creados.
[ ] Módulo NestJS creado.
[ ] DTOs implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Repositorio implementado.
[ ] Use cases implementados.
[ ] Controladores implementados.
[ ] Autenticación aplicada a endpoints privados.
[ ] Autorización aplicada.
[ ] Endpoint público implementado.
[ ] Auditoría implementada.
[ ] Eventos implementados.
[ ] Logs y traceId implementados.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Security tests pasan.
[ ] Contract tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 29. Orden recomendado de ejecución

Orden sugerido para implementación real:

```text
1. TASK-001 a TASK-008     Documentación
2. TASK-009 a TASK-011     Estructura módulo
3. TASK-012 a TASK-020     Dominio
4. TASK-021 a TASK-025     DTOs
5. TASK-026 a TASK-032     Prisma/migración/seeds
6. TASK-033 a TASK-037     Puertos
7. TASK-038 a TASK-040     Servicios
8. TASK-041 a TASK-050     Use cases
9. TASK-051 a TASK-055     Autorización
10. TASK-056 a TASK-058    Controladores
11. TASK-059 a TASK-061    Respuestas/errores
12. TASK-062 a TASK-065    OpenAPI
13. TASK-066 a TASK-083    Pruebas
14. TASK-084 a TASK-086    Observabilidad
15. TASK-087 a TASK-089    CI/CD
16. TASK-090 a TASK-094    Revisión SDD
```

---

## 30. Riesgos de ejecución

| Riesgo                                      | Impacto    | Mitigación                             |
| ------------------------------------------- | ---------- | -------------------------------------- |
| Implementar roles completos en esta spec    | Medio      | Usar `TenantBaseRolesPort` placeholder |
| Omitir autorización tenant-scoped           | Crítico    | Tests AUTH y MT obligatorios           |
| Exponer campos internos en endpoint público | Alto       | DTO público + contract tests           |
| Crear migración con cascade delete          | Crítico    | Revisión SQL + migration tests         |
| Usar WordPress como fuente transaccional    | Alto       | Mapping limitado                       |
| Saltar auditoría                            | Alto       | Audit tests obligatorios               |
| Código IA genera endpoints sin permisos     | Alto       | OpenAPI + authorization tests          |
| Tests incompletos                           | Alto       | Gate CI                                |
| Activar tenant incompleto                   | Medio      | `TenantStatusService`                  |
| Cambiar slug sin control                    | Medio-alto | Restringir a PlatformAdmin y auditar   |

---

## 31. Checklist para revisión de PR

Antes de aprobar el PR de `001-tenants`:

```text
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se creó microservicio separado.
[ ] No se implementó users/roles completos.
[ ] No se implementaron pagos/alícuotas/residentes.
[ ] Prisma schema coincide con data-model.md.
[ ] La migración fue revisada.
[ ] No hay cascade delete peligroso.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoint público no expone campos internos.
[ ] Endpoints privados requieren auth.
[ ] Endpoints privados requieren permisos.
[ ] TenantAdmin no puede modificar otro tenant.
[ ] Operaciones críticas generan auditoría.
[ ] Eventos esperados se emiten.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay secrets.
[ ] Logs no exponen tokens.
[ ] Pendientes diferidos están documentados.
```

---

## 32. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá implementada la base del multitenancy:

```text
- tenants como raíz de aislamiento;
- perfil público seguro;
- configuración básica;
- branding;
- mapeo WordPress;
- estados operativos;
- endpoints administrativos;
- endpoint público para WordPress;
- auditoría;
- eventos;
- pruebas;
- OpenAPI;
- migración PostgreSQL.
```

Este módulo habilita el siguiente módulo funcional:

```text
docs/specs/002-users-roles/
```

Pero antes de pasar a `002-users-roles`, debe completarse:

```text
docs/specs/001-tenants/security-notes.md
```
