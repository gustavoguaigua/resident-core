# Tasks — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo           | Valor                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                  |
| Spec ID         | 009                                                                                            |
| Módulo          | WordPress Integration Basic                                                                    |
| Documento       | Implementation Tasks                                                                           |
| Ruta            | `docs/specs/009-wordpress-integration-basic/tasks.md`                                          |
| Versión         | 0.1                                                                                            |
| Estado          | needs-review                                                                                   |
| Fecha           | 2026-07-14                                                                                     |
| Documento base  | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Plan técnico    | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Modelo de datos | `docs/specs/009-wordpress-integration-basic/data-model.md`                                     |
| Contrato API    | `docs/specs/009-wordpress-integration-basic/api-contract.md`                                   |
| Plan de pruebas | `docs/specs/009-wordpress-integration-basic/test-plan.md`                                      |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento convierte la spec `009-wordpress-integration-basic` en una lista ejecutable de tareas para implementar la integración básica entre el portal WordPress multitenant y RESIDENT Core.

El módulo debe permitir:

* resolver tenants públicos por slug;
* exponer perfil público del tenant;
* exponer branding público;
* exponer contacto institucional;
* exponer enlaces públicos;
* preparar endpoints de comunicados públicos;
* preparar endpoints de áreas comunales públicas;
* configurar mapping WordPress-Core desde tenant;
* configurar mapping WordPress-Core desde platform;
* restringir CORS;
* aplicar rate limiting;
* aplicar cache headers seguros;
* auditar cambios de mapping;
* evitar exposición de datos financieros;
* evitar exposición de datos personales privados;
* evitar que WordPress acceda directamente a PostgreSQL;
* preparar evolución futura hacia plugin WordPress, SSO y portal de residentes.

Regla central:

```text id="e7x4vr"
WordPress debe consumir únicamente endpoints public-safe de RESIDENT Core; no debe acceder a la base de datos, no debe recibir datos financieros y no debe convertirse en fuente de verdad transaccional.
```

---

## 3. Convenciones de estado

Usar:

```text id="pf84lq"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="d0yhox"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text id="c89gpt"
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
docs/specs/007-audit/
docs/specs/008-basic-reports/
docs/specs/009-wordpress-integration-basic/
```

Reglas de implementación:

```text id="abihhf"
1. WordPress no debe acceder directamente a PostgreSQL.
2. WordPress no debe usar credenciales de base de datos.
3. WordPress no debe ser fuente transaccional.
4. Endpoints públicos solo exponen datos public-safe.
5. Endpoints públicos no requieren usuario autenticado.
6. Endpoints públicos sí requieren validación, rate limiting, CORS y DTO seguro.
7. Endpoints públicos no exponen saldos.
8. Endpoints públicos no exponen pagos.
9. Endpoints públicos no exponen cargos.
10. Endpoints públicos no exponen estados de cuenta.
11. Endpoints públicos no exponen comprobantes.
12. Endpoints públicos no exponen datos personales privados.
13. Endpoints públicos no exponen roles.
14. Endpoints públicos no exponen permisos.
15. Endpoints públicos no exponen audit_logs.
16. Tenant público se resuelve por slug.
17. El slug debe validarse estrictamente.
18. Tenant no activo no debe publicarse como activo.
19. Perfil hidden/draft/unpublished/archived no debe publicarse.
20. CORS no debe usar wildcard en producción.
21. Rate limiting debe aplicarse a endpoints públicos.
22. Cache público solo aplica a datos public-safe.
23. Endpoints administrativos tenant requieren AuthGuard, TenantGuard y permisos.
24. Endpoints administrativos platform requieren AuthGuard y permisos platform.
25. Cambios de mapping deben auditarse.
26. Mapping no debe guardar tokens.
27. Mapping no debe guardar cookies.
28. Mapping no debe guardar secrets.
29. URLs deben validarse y usar HTTPS en producción.
30. Origins deben ser origins válidos, no URLs con path.
31. No implementar SSO en esta spec.
32. No implementar pagos desde WordPress en esta spec.
33. No implementar reservas desde WordPress en esta spec.
34. No implementar plugin WordPress avanzado en esta spec.
35. No implementar GraphQL en esta spec.
```

---

## 5. Entregables esperados

Documentación:

```text id="dzjm5v"
docs/specs/009-wordpress-integration-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text id="epdk3t"
apps/api/src/modules/integrations/wordpress/
├── wordpress-integration.module.ts
├── public-wordpress.controller.ts
├── tenant-wordpress-integration.controller.ts
├── platform-wordpress-integration.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

Base de datos:

```text id="vfi68q"
tenant_public_profiles
tenant_wordpress_mappings
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="oogjgu"
docs/specs/009-wordpress-integration-basic/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura de specs anteriores.
* No reemplaza documentos de specs `001` a `008`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="va7ox5"
docs/specs/009-wordpress-integration-basic/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define reglas de negocio.
* Define endpoints preliminares.
* Define actores.
* Define datos públicos permitidos.
* Define datos prohibidos.
* Define riesgos.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="vubdb3"
docs/specs/009-wordpress-integration-basic/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define estructura de carpetas.
* Define servicios.
* Define casos de uso.
* Define puertos.
* Define controladores.
* Define CORS/cache/rate limiting.
* Define diferidos.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="u92u43"
docs/specs/009-wordpress-integration-basic/data-model.md
```

### Criterios de aceptación

* Define `tenant_public_profiles`.
* Define `tenant_wordpress_mappings`.
* Define enums.
* Define constraints.
* Define índices.
* Define Prisma preliminar.
* Define mapeo con ACF.
* Define clasificación de campos.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="rmms6y"
docs/specs/009-wordpress-integration-basic/api-contract.md
```

### Criterios de aceptación

* Define endpoints públicos.
* Define endpoints tenant administrativos.
* Define endpoints platform administrativos.
* Define DTOs.
* Define errores.
* Define CORS.
* Define cache.
* Define rate limiting.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="vyq5ca"
docs/specs/009-wordpress-integration-basic/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define integration tests.
* Define API tests.
* Define CORS tests.
* Define rate limit tests.
* Define cache tests.
* Define authorization tests.
* Define multitenancy tests.
* Define security tests.
* Define compatibility tests.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text id="vijg1v"
docs/specs/009-wordpress-integration-basic/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Estados definidos.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="xn4139"
docs/specs/009-wordpress-integration-basic/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos públicos.
* Identifica riesgos de CORS.
* Identifica riesgos de cache.
* Identifica riesgos de exposición financiera.
* Identifica riesgos de exposición personal.
* Define controles de mapping.
* Define controles de WordPress.
* Define controles de logs y métricas.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `wordpress-integration`

**Estado:** `[ ] Pending`

### Archivo

```text id="md1055"
apps/api/src/modules/integrations/wordpress/wordpress-integration.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en el módulo padre de integraciones o `AppModule`.
* Expone providers necesarios.
* No contiene lógica de negocio.
* No depende directamente de WordPress.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="zy7ekh"
apps/api/src/modules/integrations/wordpress/
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
│   ├── cache/
│   └── audit/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de Prisma.
* Controladores no usan Prisma directamente.
* Repositorios quedan en infraestructura.
* Servicios aplican reglas public-safe.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="fvxlqz"
public-wordpress.controller.ts
tenant-wordpress-integration.controller.ts
platform-wordpress-integration.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `WordPressIntegrationModule`.
* Definen rutas base correctas.
* No contienen lógica de negocio.
* Invocan casos de uso.

---

# 8. Fase 2 — Value Objects

## TASK-012 — Implementar `WordPressSlug`

**Estado:** `[ ] Pending`

### Archivo

```text id="gp3760"
domain/value-objects/wordpress-slug.vo.ts
```

### Criterios de aceptación

* Valida formato `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
* Rechaza slash.
* Rechaza path traversal.
* Rechaza HTML/script.
* Rechaza vacío.
* Rechaza longitud excesiva.
* Tiene unit tests.

---

## TASK-013 — Implementar `WordPressUrl`

**Estado:** `[ ] Pending`

### Archivo

```text id="tu9caz"
domain/value-objects/wordpress-url.vo.ts
```

### Criterios de aceptación

* Valida URL.
* Exige HTTPS en producción.
* Permite localhost en desarrollo si se configura.
* Rechaza `javascript:`.
* Rechaza `file:`.
* Rechaza `data:`.
* Rechaza `ftp:`.
* Tiene unit tests.

---

## TASK-014 — Implementar `WordPressOrigin`

**Estado:** `[ ] Pending`

### Archivo

```text id="q6no00"
domain/value-objects/wordpress-origin.vo.ts
```

### Criterios de aceptación

* Valida origin como scheme + host + optional port.
* Rechaza URLs con path.
* Rechaza wildcard en producción.
* Rechaza `null`.
* Rechaza `file://`.
* Permite localhost en desarrollo si se configura.
* Tiene unit tests.

---

## TASK-015 — Implementar `PublicVisibility`

**Estado:** `[ ] Pending`

### Archivo

```text id="vgwv2l"
domain/value-objects/public-visibility.vo.ts
```

### Criterios de aceptación

* Soporta `visible`.
* Soporta `hidden`.
* Soporta `restricted`.
* Solo `visible` permite endpoint público ordinario.
* Tiene unit tests.

---

## TASK-016 — Implementar `PublicFieldClassification`

**Estado:** `[ ] Pending`

### Archivo

```text id="arft0f"
domain/value-objects/public-field-classification.vo.ts
```

### Criterios de aceptación

* Soporta `public`.
* Soporta `publicDerived`.
* Soporta `restricted`.
* Soporta `private`.
* Soporta `sensitive`.
* Solo `public` y `publicDerived` son exportables por endpoint público.
* Tiene unit tests.

---

## TASK-017 — Implementar `PublicCachePolicy`

**Estado:** `[ ] Pending`

### Archivo

```text id="zt90id"
domain/value-objects/public-cache-policy.vo.ts
```

### Criterios de aceptación

* Define `cacheable`.
* Define `maxAgeSeconds`.
* Define `etagEnabled`.
* Define `lastModifiedEnabled`.
* Impide public cache sobre datos privados.
* Tiene unit tests.

---

## TASK-018 — Implementar `PublicLink`

**Estado:** `[ ] Pending`

### Archivo

```text id="jobvks"
domain/value-objects/public-link.vo.ts
```

### Criterios de aceptación

* Valida URL.
* Exige HTTPS en producción.
* Rechaza tokens en query.
* Rechaza session IDs.
* Rechaza URLs internas privadas si se configura.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-019 — Implementar `WordPressPublicTenant`

**Estado:** `[ ] Pending`

### Archivo

```text id="k35khf"
domain/entities/wordpress-public-tenant.entity.ts
```

### Criterios de aceptación

* Representa tenant público.
* Requiere slug.
* Requiere publicName para publicación visible.
* Determina si es publicable.
* No expone tenantId interno en DTO público.
* Tiene unit tests.

---

## TASK-020 — Implementar `WordPressPublicProfile`

**Estado:** `[ ] Pending`

### Archivo

```text id="sozqts"
domain/entities/wordpress-public-profile.entity.ts
```

### Criterios de aceptación

* Representa perfil público.
* Incluye historia/misión/visión si están publicadas.
* Incluye branding/contact/links.
* Respeta clasificación de campos.
* No permite datos financieros.
* No permite datos personales privados.
* Tiene unit tests.

---

## TASK-021 — Implementar `WordPressBranding`

**Estado:** `[ ] Pending`

### Archivo

```text id="d3s65w"
domain/entities/wordpress-branding.entity.ts
```

### Criterios de aceptación

* Valida logo URL.
* Valida banner URL.
* Valida gallery URLs.
* Valida colores HEX.
* No expone rutas internas de storage.
* Tiene unit tests.

---

## TASK-022 — Implementar `WordPressContact`

**Estado:** `[ ] Pending`

### Archivo

```text id="mndjyn"
domain/entities/wordpress-contact.entity.ts
```

### Criterios de aceptación

* Representa contacto institucional.
* Valida email.
* Valida teléfono/WhatsApp según política.
* Valida social links.
* No permite contacto personal de residentes o propietarios.
* Tiene unit tests.

---

## TASK-023 — Implementar `WordPressMapping`

**Estado:** `[ ] Pending`

### Archivo

```text id="ih58cu"
domain/entities/wordpress-mapping.entity.ts
```

### Criterios de aceptación

* Requiere tenantId.
* Requiere wordpressSlug.
* Valida wordpressUrl.
* Valida wordpressAllowedOrigin.
* Soporta integrationStatus.
* Soporta isPublicVisible.
* Rechaza tokens/secrets/cookies.
* Tiene unit tests.

---

## TASK-024 — Implementar `WordPressPublicAnnouncement`

**Estado:** `[ ] Pending`

### Archivo

```text id="uqivcr"
domain/entities/wordpress-public-announcement.entity.ts
```

### Criterios de aceptación

* Representa comunicado público.
* Solo publicable si `visibility = public`.
* Solo publicable si `status = published`.
* No incluye adjuntos privados.
* Queda desacoplado si módulo de comunicados está diferido.
* Tiene unit tests si se implementa.

---

## TASK-025 — Implementar `WordPressPublicCommonArea`

**Estado:** `[ ] Pending`

### Archivo

```text id="blc4c6"
domain/entities/wordpress-public-common-area.entity.ts
```

### Criterios de aceptación

* Representa área comunal pública.
* Solo publicable si `status = active`.
* Solo publicable si `isPublicVisible = true`.
* No expone disponibilidad privada.
* No permite reserva.
* Tiene unit tests si se implementa.

---

## TASK-026 — Implementar eventos internos

**Estado:** `[ ] Pending`

### Archivos

```text id="wyhqb0"
wordpress-mapping-updated.event.ts
tenant-public-profile-updated.event.ts
tenant-public-visibility-updated.event.ts
wordpress-origin-denied.event.ts
wordpress-public-endpoint-access-denied.event.ts
```

### Criterios de aceptación

* Incluyen tenantId si aplica.
* Incluyen slug/origin si aplica.
* Incluyen actorUserId para acciones administrativas.
* Incluyen traceId.
* No incluyen payload completo.
* No incluyen tokens/secrets.

---

## TASK-027 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos

```text id="swzz7e"
public-tenant-not-found.error.ts
public-tenant-not-visible.error.ts
wordpress-slug-invalid.error.ts
wordpress-url-invalid.error.ts
wordpress-origin-invalid.error.ts
wordpress-origin-denied.error.ts
wordpress-mapping-not-found.error.ts
wordpress-mapping-duplicate.error.ts
wordpress-mapping-forbidden.error.ts
wordpress-mapping-invalid-status.error.ts
public-resource-not-found.error.ts
public-field-not-allowed.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.

---

# 10. Fase 4 — Base de datos y Prisma

## TASK-028 — Crear migración de integración WordPress

**Estado:** `[ ] Pending`

### Nombre sugerido

```text id="a7wpna"
009_create_tenant_public_profiles_and_wordpress_mappings
```

### Criterios de aceptación

* Crea enums requeridos.
* Crea `tenant_public_profiles`.
* Crea `tenant_wordpress_mappings`.
* Crea índices.
* Crea constraints.
* Puede ejecutarse en DB test.
* No rompe specs anteriores.

---

## TASK-029 — Agregar enums Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="e8xusg"
PublicProfileVisibility
PublicProfileStatus
WordPressIntegrationStatus
```

### Criterios de aceptación

* Enums definidos en schema Prisma.
* Mapeados a valores snake/lowercase si aplica.
* Prisma Client genera correctamente.

---

## TASK-030 — Agregar modelo `TenantPublicProfile`

**Estado:** `[ ] Pending`

### Archivo

```text id="eurvvw"
prisma/schema.prisma
```

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Unique por tenant.
* Unique por publicSlug.
* Índices creados.
* Campos JSON definidos correctamente.
* Soft delete con archivedAt.

---

## TASK-031 — Agregar modelo `TenantWordPressMapping`

**Estado:** `[ ] Pending`

### Archivo

```text id="utgdvd"
prisma/schema.prisma
```

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación opcional con UserProfile para createdBy/updatedBy.
* Unique por tenant.
* Unique por wordpressSlug.
* Índices creados.
* No contiene campos de tokens/secrets.

---

## TASK-032 — Agregar relaciones en `Tenant`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `Tenant` tiene relación opcional con `TenantPublicProfile`.
* `Tenant` tiene relación opcional con `TenantWordPressMapping`.
* No se eliminan relaciones existentes.
* Prisma genera correctamente.

---

## TASK-033 — Agregar relaciones en `UserProfile`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Relaciones para mappings creados/actualizados agregadas si se usa createdBy/updatedBy.
* No rompe módulo `002-users-roles`.
* Prisma genera correctamente.

---

## TASK-034 — Crear seeds demo

**Estado:** `[ ] Pending`

### Seeds

```text id="zxz2zz"
tenantPublicProfileSanJoseLaSalle2
tenantPublicProfileAltosDelNorte
tenantPublicProfileJardinesDelValle
tenantPublicProfilePortalDelRio
wordpressMappingSanJoseLaSalle2
wordpressMappingAltosDelNorte
wordpressMappingJardinesDelValle
wordpressMappingPortalDelRio
```

### Criterios de aceptación

* No usan datos reales de residentes.
* No usan datos financieros.
* No usan secretos.
* Permiten probar endpoints públicos.
* Permiten probar CORS.

---

# 11. Fase 5 — DTOs y validación

## TASK-035 — Crear DTOs públicos

**Estado:** `[ ] Pending`

### Archivos

```text id="v5zygv"
public-tenant.dto.ts
public-branding.dto.ts
public-contact.dto.ts
public-links.dto.ts
public-announcement-list-item.dto.ts
public-announcement-detail.dto.ts
public-common-area.dto.ts
```

### Criterios de aceptación

* Solo incluyen campos public-safe.
* No incluyen tenantId interno.
* No incluyen datos financieros.
* No incluyen datos personales privados.
* No incluyen roles/permisos.
* Tienen tests de mapping.

---

## TASK-036 — Crear DTOs administrativos de mapping

**Estado:** `[ ] Pending`

### Archivos

```text id="f5kg6z"
wordpress-mapping.dto.ts
update-wordpress-mapping.dto.ts
```

### Criterios de aceptación

* Valida slug.
* Valida URL.
* Valida origin.
* Valida integrationStatus.
* Rechaza tenantId en body o lo ignora de forma segura.
* Rechaza tokens/secrets/cookies.
* Tiene DTO tests.

---

## TASK-037 — Crear DTOs de query pública

**Estado:** `[ ] Pending`

### Archivos

```text id="un1xcl"
public-list-query.dto.ts
public-announcements-query.dto.ts
public-common-areas-query.dto.ts
```

### Criterios de aceptación

* page default 1.
* pageSize default 20.
* pageSize máximo 50.
* q con longitud máxima.
* category validado si aplica.
* Tiene tests.

---

## TASK-038 — Crear response wrappers

**Estado:** `[ ] Pending`

### Archivos

```text id="mdwlme"
public-response.dto.ts
public-paginated-response.dto.ts
```

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No expone entidades internas.

---

# 12. Fase 6 — Puertos y repositorios

## TASK-039 — Crear `WordPressPublicReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="j1wjvh"
application/ports/wordpress-public-reader.port.ts
```

### Criterios de aceptación

* Define métodos para tenant público.
* Define métodos para branding.
* Define métodos para contacto.
* Define métodos para links.
* Define métodos para comunicados si aplica.
* Define métodos para áreas comunales si aplica.
* Es read-only.

---

## TASK-040 — Crear `WordPressMappingReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="q0tgcl"
application/ports/wordpress-mapping-reader.port.ts
```

### Criterios de aceptación

* Permite consultar mapping por tenant.
* Permite consultar mapping por slug.
* Permite consultar mapping por origin si aplica.
* No expone operaciones de escritura.

---

## TASK-041 — Crear `WordPressMappingWriterPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="eq5ha4"
application/ports/wordpress-mapping-writer.port.ts
```

### Criterios de aceptación

* Permite actualizar mapping tenant.
* Permite actualizar mapping platform.
* No acepta tenantId desde body tenant.
* Recibe actor para auditoría.

---

## TASK-042 — Crear puertos de políticas

**Estado:** `[ ] Pending`

### Archivos

```text id="z1ztva"
wordpress-origin-policy.port.ts
wordpress-cache-policy.port.ts
wordpress-audit.port.ts
```

### Criterios de aceptación

* Separan CORS, cache y auditoría.
* No dependen de infraestructura.
* Tienen contratos claros.

---

## TASK-043 — Implementar `PrismaWordPressPublicRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="r24we8"
infrastructure/persistence/prisma-wordpress-public.repository.ts
```

### Criterios de aceptación

* Resuelve tenant por slug.
* Lee perfil público.
* Lee branding.
* Lee contacto.
* Lee links.
* Aplica tenant active check.
* Aplica visibility/status check.
* No devuelve datos privados.
* Tiene integration tests.

---

## TASK-044 — Implementar `PrismaWordPressMappingRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="zajcnd"
infrastructure/persistence/prisma-wordpress-mapping.repository.ts
```

### Criterios de aceptación

* Lee mapping tenant.
* Lee mapping platform.
* Actualiza mapping.
* Valida duplicidad.
* Persiste createdBy/updatedBy si aplica.
* No guarda secretos.
* Tiene integration tests.

---

## TASK-045 — Implementar `WordPressMapper`

**Estado:** `[ ] Pending`

### Archivo

```text id="q5mhjx"
infrastructure/persistence/wordpress.mapper.ts
```

### Criterios de aceptación

* Convierte DB models a entidades/DTOs.
* Aplica field allowlist.
* Omite datos restricted/private/sensitive en DTO público.
* Normaliza URLs.
* Tiene tests.

---

# 13. Fase 7 — Servicios de aplicación

## TASK-046 — Implementar `WordPressPublicTenantService`

**Estado:** `[ ] Pending`

### Archivo

```text id="e4wzcs"
application/services/wordpress-public-tenant.service.ts
```

### Criterios de aceptación

* Valida slug.
* Resuelve tenant activo.
* Verifica visible/published.
* Devuelve 404 seguro si no publicable.
* No expone datos privados.
* Tiene tests.

---

## TASK-047 — Implementar `WordPressPublicProfileService`

**Estado:** `[ ] Pending`

### Archivo

```text id="wwrbys"
application/services/wordpress-public-profile.service.ts
```

### Criterios de aceptación

* Construye perfil público.
* Construye branding.
* Construye contacto.
* Construye links.
* Aplica allowlist de campos.
* Tiene tests.

---

## TASK-048 — Implementar `WordPressMappingService`

**Estado:** `[ ] Pending`

### Archivo

```text id="o5jv2n"
application/services/wordpress-mapping.service.ts
```

### Criterios de aceptación

* Lee mapping tenant.
* Actualiza mapping tenant.
* Lee mapping platform.
* Actualiza mapping platform.
* Valida slug.
* Valida URL.
* Valida origin.
* Valida duplicidad.
* Audita cambios.
* Tiene tests.

---

## TASK-049 — Implementar `WordPressCorsPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="d45wox"
application/services/wordpress-cors-policy.service.ts
```

### Criterios de aceptación

* Valida origin permitido.
* Rechaza wildcard en producción.
* Rechaza origin con path.
* Rechaza null origin.
* Permite localhost solo en desarrollo.
* Tiene tests.

---

## TASK-050 — Implementar `WordPressCachePolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="p0c0i6"
application/services/wordpress-cache-policy.service.ts
```

### Criterios de aceptación

* Genera Cache-Control público para public-safe.
* Genera TTL 300 segundos por defecto.
* Genera TTL corto para 404 público si aplica.
* No aplica public cache a endpoints admin.
* Soporta ETag/Last-Modified si se implementa.
* Tiene tests.

---

## TASK-051 — Implementar `WordPressRateLimitPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="v8yz9b"
application/services/wordpress-rate-limit-policy.service.ts
```

### Criterios de aceptación

* Define límites públicos.
* Define límites reforzados para detalle.
* Integra con rate limiting global.
* Tiene tests o configuración verificable.

---

## TASK-052 — Implementar `WordPressPublicDtoMapperService`

**Estado:** `[ ] Pending`

### Archivo

```text id="n4esig"
application/services/wordpress-public-dto-mapper.service.ts
```

### Criterios de aceptación

* Mapea DTOs públicos.
* Omite tenantId interno.
* Omite datos financieros.
* Omite datos personales privados.
* Omite roles/permisos.
* Tiene tests.

---

## TASK-053 — Implementar `WordPressFieldClassificationService`

**Estado:** `[ ] Pending`

### Archivo

```text id="rfgdin"
application/services/wordpress-field-classification.service.ts
```

### Criterios de aceptación

* Clasifica campos.
* Bloquea restricted/private/sensitive.
* Bloquea campos financieros.
* Bloquea campos personales privados.
* Tiene tests.

---

## TASK-054 — Implementar `WordPressIntegrationAuditService`

**Estado:** `[ ] Pending`

### Archivo

```text id="z21si9"
application/services/wordpress-integration-audit.service.ts
```

### Criterios de aceptación

* Audita mapping update.
* Audita public profile update si aplica.
* Audita public visibility update si aplica.
* Audita origin denied si aplica.
* No audita cada visita pública ordinaria.
* No registra payload completo.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-055 — Implementar `GetPublicTenantUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="fzl5cu"
GET /api/v1/public/tenants/{slug}
```

### Criterios de aceptación

* Valida slug.
* Resuelve tenant activo visible.
* Devuelve PublicTenantDto.
* Aplica cache headers.
* Aplica rate limiting.
* No requiere auth.
* Tiene tests.

---

## TASK-056 — Implementar `GetPublicTenantBrandingUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="x4dfn9"
GET /api/v1/public/tenants/{slug}/branding
```

### Criterios de aceptación

* Valida slug.
* Devuelve branding public-safe.
* Valida URLs/colores.
* No expone storage interno.
* Aplica cache.
* Tiene tests.

---

## TASK-057 — Implementar `GetPublicTenantContactUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="fytd35"
GET /api/v1/public/tenants/{slug}/contact
```

### Criterios de aceptación

* Devuelve contacto institucional.
* No expone contacto personal.
* Valida social links.
* Aplica cache.
* Tiene tests.

---

## TASK-058 — Implementar `GetPublicTenantLinksUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="lf8wxo"
GET /api/v1/public/tenants/{slug}/links
```

### Criterios de aceptación

* Devuelve websiteUrl.
* Devuelve residentPortalUrl si existe.
* No incluye tokens.
* No incluye session IDs.
* No incluye URLs internas.
* Tiene tests.

---

## TASK-059 — Implementar `ListPublicAnnouncementsUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="velsyd"
GET /api/v1/public/tenants/{slug}/announcements
```

### Criterios de aceptación

* Lista solo comunicados públicos publicados.
* Excluye privados.
* Excluye drafts.
* Excluye Tenant B.
* Pagina.
* Si módulo de comunicados no existe, diferir controladamente.
* Tiene tests si se implementa.

---

## TASK-060 — Implementar `GetPublicAnnouncementUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="kvb9by"
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
```

### Criterios de aceptación

* Devuelve solo comunicado público publicado.
* Devuelve 404 para privado/draft/no tenant.
* Valida announcementSlug.
* No expone adjuntos privados.
* Tiene tests si se implementa.

---

## TASK-061 — Implementar `ListPublicCommonAreasUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="inredm"
GET /api/v1/public/tenants/{slug}/common-areas
```

### Criterios de aceptación

* Lista solo áreas activas visibles.
* Excluye privadas.
* Excluye inactivas.
* No expone disponibilidad privada.
* No permite reserva.
* Si módulo de áreas no existe, diferir controladamente.
* Tiene tests si se implementa.

---

## TASK-062 — Implementar `GetPublicCommonAreaUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="w3rbm7"
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

### Criterios de aceptación

* Devuelve solo área pública activa.
* Devuelve 404 para privada/inactiva/otro tenant.
* No expone calendario privado.
* No permite reserva.
* Tiene tests si se implementa.

---

## TASK-063 — Implementar `GetTenantWordPressMappingUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="zya23d"
GET /api/v1/tenant/integrations/wordpress
```

### Criterios de aceptación

* Requiere auth.
* Requiere membership activa.
* Requiere `integrations.wordpress.read`.
* Usa tenant del contexto.
* No lee mapping de otro tenant.
* Tiene tests.

---

## TASK-064 — Implementar `UpdateTenantWordPressMappingUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="zq9e59"
PATCH /api/v1/tenant/integrations/wordpress
```

### Criterios de aceptación

* Requiere auth.
* Requiere `integrations.wordpress.update`.
* Usa tenant del contexto.
* No acepta tenantId desde body.
* Valida slug/URL/origin/status.
* Valida duplicidad.
* Rechaza secretos.
* Audita cambio.
* Tiene tests.

---

## TASK-065 — Implementar `GetPlatformWordPressMappingUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="ticm9r"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

### Criterios de aceptación

* Requiere auth.
* Requiere `integrations.wordpress.platform.read`.
* Valida tenantId.
* Devuelve mapping del tenant solicitado.
* No requiere membership tenant.
* Tiene tests.

---

## TASK-066 — Implementar `UpdatePlatformWordPressMappingUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="se1c3u"
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

### Criterios de aceptación

* Requiere auth.
* Requiere `integrations.wordpress.platform.update`.
* Valida tenant.
* Valida mapping.
* Rechaza duplicados.
* Rechaza secretos.
* Audita cambio platform.
* Tiene tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-067 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Protege endpoints administrativos.
* No se exige en endpoints públicos.
* Bloquea usuarios deshabilitados.

---

## TASK-068 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo para endpoints tenant.
* Valida membership.
* No confía solo en header.
* No se usa en endpoints públicos por slug.

---

## TASK-069 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `integrations.wordpress.read`.
* Valida `integrations.wordpress.update`.
* No permite acceso sin permisos.

---

## TASK-070 — Crear `WordPressMappingPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="zr5tce"
policies/wordpress-mapping-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos tenant de mapping.
* Compatible con decorators.
* Tiene tests.

---

## TASK-071 — Crear `PlatformWordPressMappingPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="r5eoir"
policies/platform-wordpress-mapping-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos platform.
* Bloquea usuarios tenant sin permiso platform.
* Tiene tests.

---

## TASK-072 — Crear `WordPressCorsGuard` o middleware equivalente

**Estado:** `[ ] Pending`

### Archivo

```text id="trdj8w"
policies/wordpress-cors.guard.ts
```

### Criterios de aceptación

* Valida Origin.
* Devuelve header CORS permitido.
* Rechaza wildcard en producción.
* Usa `Vary: Origin`.
* Tiene CORS tests.

---

## TASK-073 — Crear `WordPressPublicRateLimitGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="ntcfov"
policies/wordpress-public-rate-limit.guard.ts
```

### Criterios de aceptación

* Aplica a endpoints públicos.
* Retorna 429 al exceder.
* Tiene tests.

---

## TASK-074 — Crear decorators de permisos WordPress

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="wfew33"
@RequireWordPressIntegrationPermission()
@RequirePlatformWordPressIntegrationPermission()
@PublicSafeEndpoint()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-075 — Implementar `PublicWordPressController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="tvcpm7"
GET /api/v1/public/tenants/:slug
GET /api/v1/public/tenants/:slug/branding
GET /api/v1/public/tenants/:slug/contact
GET /api/v1/public/tenants/:slug/links
GET /api/v1/public/tenants/:slug/announcements
GET /api/v1/public/tenants/:slug/announcements/:announcementSlug
GET /api/v1/public/tenants/:slug/common-areas
GET /api/v1/public/tenants/:slug/common-areas/:commonAreaSlug
```

### Criterios de aceptación

* Usa DTOs.
* Usa casos de uso.
* Aplica rate limiting.
* Aplica cache.
* Aplica CORS.
* No requiere auth.
* No tiene métodos públicos de escritura.
* Tiene API tests.

---

## TASK-076 — Implementar `TenantWordPressIntegrationController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="a1paqz"
GET /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa permisos.
* Usa DTOs.
* Usa casos de uso.
* No acepta tenantId desde body.
* Tiene API tests.

---

## TASK-077 — Implementar `PlatformWordPressIntegrationController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="rgwsja"
GET /api/v1/platform/tenants/:tenantId/integrations/wordpress
PATCH /api/v1/platform/tenants/:tenantId/integrations/wordpress
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa permisos platform.
* Valida tenantId.
* Usa DTOs.
* Usa casos de uso.
* Tiene API tests.

---

# 17. Fase 11 — Errores y responses

## TASK-078 — Mapear errores a HTTP

**Estado:** `[ ] Pending`

### Mapeos

```text id="gmq06d"
PUBLIC_TENANT_NOT_FOUND -> 404
PUBLIC_TENANT_NOT_VISIBLE -> 404
WORDPRESS_SLUG_INVALID -> 422
WORDPRESS_URL_INVALID -> 422
WORDPRESS_ORIGIN_INVALID -> 422
WORDPRESS_ORIGIN_DENIED -> 403
PUBLIC_RESOURCE_NOT_FOUND -> 404
WORDPRESS_MAPPING_NOT_FOUND -> 404
WORDPRESS_MAPPING_DUPLICATE -> 409
WORDPRESS_MAPPING_FORBIDDEN -> 403
WORDPRESS_MAPPING_INVALID_STATUS -> 422
PUBLIC_FIELD_NOT_ALLOWED -> 422
RATE_LIMITED -> 429
```

### Criterios de aceptación

* Error estándar.
* Incluye traceId.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.

---

## TASK-079 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No retorna entidades internas.
* No retorna headers/cookies/tokens.

---

# 18. Fase 12 — CORS, cache y rate limiting

## TASK-080 — Configurar CORS público restringido

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Permite origin configurado.
* Rechaza origin no permitido.
* Rechaza wildcard en producción.
* Incluye `Vary: Origin`.
* Tiene tests.

---

## TASK-081 — Configurar cache headers

**Estado:** `[ ] Pending`

### Headers sugeridos

```text id="bkdm6g"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

### Criterios de aceptación

* Aplica a endpoints public-safe.
* No aplica public cache a admin endpoints.
* No cachea errores sensibles.
* Tiene tests.

---

## TASK-082 — Configurar rate limiting público

**Estado:** `[ ] Pending`

### Config sugerida

```text id="lvf4j8"
PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS=60
PUBLIC_API_RATE_LIMIT_MAX_REQUESTS=120
PUBLIC_DETAIL_RATE_LIMIT_MAX_REQUESTS=60
```

### Criterios de aceptación

* Aplica a endpoints públicos.
* Responde 429 si excede.
* Incluye traceId.
* Tiene tests.

---

# 19. Fase 13 — Auditoría y observabilidad

## TASK-083 — Auditar cambios de mapping

**Estado:** `[ ] Pending`

### Eventos

```text id="lzaea6"
tenant.wordpressMapping.updated
wordpress.integration.updated
```

### Criterios de aceptación

* Toda actualización genera audit event.
* Metadata contiene changedFields.
* Metadata no contiene payload completo.
* Metadata no contiene secrets.
* Tiene tests.

---

## TASK-084 — Auditar cambios de perfil público si se implementan

**Estado:** `[ ] Pending`

### Eventos

```text id="vv60jh"
tenant.publicProfile.updated
tenant.publicVisibility.updated
```

### Criterios de aceptación

* Cambios generan audit event.
* No se audita contenido completo sensible.
* Tiene tests si aplica.

---

## TASK-085 — Auditar anomalías relevantes

**Estado:** `[ ] Pending`

### Eventos recomendados

```text id="fmoume"
wordpress.origin.denied
wordpress.publicEndpoint.accessDenied
wordpress.tenantSlug.notFound
wordpress.integration.validationFailed
```

### Criterios de aceptación

* No audita cada visita ordinaria.
* Audita solo eventos relevantes.
* Metadata sanitizada.
* Tiene tests.

---

## TASK-086 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Logs

```text id="fu7yds"
wordpress.publicTenant.resolved
wordpress.publicTenant.notFound
wordpress.publicBranding.resolved
wordpress.publicContact.resolved
wordpress.publicLinks.resolved
wordpress.publicEndpoint.cacheHit
wordpress.publicEndpoint.cacheMiss
wordpress.publicEndpoint.rateLimited
wordpress.origin.denied
wordpress.mapping.updated
wordpress.mapping.updateFailed
```

### Criterios de aceptación

* Incluyen traceId.
* No contienen headers completos.
* No contienen cookies.
* No contienen tokens.
* No contienen datos financieros.
* No contienen datos personales privados.

---

## TASK-087 — Agregar métricas

**Estado:** `[ ] Pending`

### Métricas

```text id="wgmk2o"
wordpress_public_requests_total
wordpress_public_requests_denied_total
wordpress_public_request_latency_ms
wordpress_public_cache_hit_total
wordpress_public_cache_miss_total
wordpress_mapping_updates_total
wordpress_public_rate_limited_total
wordpress_origin_denied_total
```

### Criterios de aceptación

* Métricas incrementan.
* Labels permitidos: endpoint, outcome, cacheStatus.
* No usan tenantId.
* No usan slug.
* No usan ipAddress.
* No usan userAgent.
* Tiene tests o verificación.

---

# 20. Fase 14 — OpenAPI

## TASK-088 — Documentar endpoints públicos

**Estado:** `[ ] Pending`

### Endpoints

```text id="b38mw0"
GET /api/v1/public/tenants/{slug}
GET /api/v1/public/tenants/{slug}/branding
GET /api/v1/public/tenants/{slug}/contact
GET /api/v1/public/tenants/{slug}/links
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

### Criterios de aceptación

* Documenta params.
* Documenta responses.
* Documenta errores.
* Documenta cache.
* Documenta rate limit.
* Marca como public-safe.

---

## TASK-089 — Documentar endpoints tenant administrativos

**Estado:** `[ ] Pending`

### Endpoints

```text id="dcdhid"
GET /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

### Criterios de aceptación

* Documenta permisos.
* Documenta request body.
* Documenta auditoría.
* Documenta errores.

---

## TASK-090 — Documentar endpoints platform administrativos

**Estado:** `[ ] Pending`

### Endpoints

```text id="x3n91d"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

### Criterios de aceptación

* Documenta permisos platform.
* Documenta tenantId.
* Documenta auditoría.
* Documenta errores.

---

## TASK-091 — Agregar extensiones OpenAPI

**Estado:** `[ ] Pending`

### Extensiones sugeridas

```yaml id="ydh38i"
x-public-safe: true
x-tenant-resolution: slug
x-auth-required: false
x-cors-restricted: true
x-cacheable: true
x-rate-limited: true
x-no-financial-data: true
x-no-private-personal-data: true
```

```yaml id="l7wxj9"
x-required-permission: integrations.wordpress.update
x-tenant-scope: tenant
x-audit-event: tenant.wordpressMapping.updated
x-auth-required: true
```

### Criterios de aceptación

* Extensiones agregadas.
* No documenta endpoints públicos de pago/saldos.
* No documenta POST/PATCH/DELETE públicos.
* OpenAPI valida.

---

# 21. Fase 15 — Pruebas unitarias

## TASK-092 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="fgxyla"
wordpress-slug.vo.spec.ts
wordpress-url.vo.spec.ts
wordpress-origin.vo.spec.ts
public-visibility.vo.spec.ts
public-field-classification.vo.spec.ts
public-cache-policy.vo.spec.ts
public-link.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos UT-WP.
* Pasan en CI.

---

## TASK-093 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="dvbkzg"
wordpress-public-tenant.entity.spec.ts
wordpress-public-profile.entity.spec.ts
wordpress-branding.entity.spec.ts
wordpress-contact.entity.spec.ts
wordpress-mapping.entity.spec.ts
wordpress-public-announcement.entity.spec.ts
wordpress-public-common-area.entity.spec.ts
```

### Criterios de aceptación

* Cubren entidades implementadas.
* Cubren errores.
* Cubren no exposición de campos privados.
* Pasan en CI.

---

## TASK-094 — Implementar tests de DTOs

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Public DTO mapper.
* UpdateWordPressMappingDto.
* Public list query DTOs.
* Rechazo de secretos.
* Rechazo de URLs/origins inválidos.
* Pasan en CI.

---

# 22. Fase 16 — Pruebas de aplicación e integración

## TASK-095 — Implementar tests de servicios

**Estado:** `[ ] Pending`

### Servicios

```text id="bk8g1m"
WordPressPublicTenantService
WordPressPublicProfileService
WordPressMappingService
WordPressCorsPolicyService
WordPressCachePolicyService
WordPressFieldClassificationService
WordPressIntegrationAuditService
```

### Criterios de aceptación

* Caminos felices.
* Errores.
* Datos no publicables.
* CORS.
* Cache.
* Auditoría.
* Pasan en CI.

---

## TASK-096 — Implementar tests de casos de uso

**Estado:** `[ ] Pending`

### Use cases

```text id="exwbl4"
GetPublicTenantUseCase
GetPublicTenantBrandingUseCase
GetPublicTenantContactUseCase
GetPublicTenantLinksUseCase
ListPublicAnnouncementsUseCase
GetPublicAnnouncementUseCase
ListPublicCommonAreasUseCase
GetPublicCommonAreaUseCase
GetTenantWordPressMappingUseCase
UpdateTenantWordPressMappingUseCase
GetPlatformWordPressMappingUseCase
UpdatePlatformWordPressMappingUseCase
```

### Criterios de aceptación

* Cubren APP-WP.
* Incluyen permisos.
* Incluyen no exposición.
* Incluyen multitenancy.
* Incluyen auditoría.
* Pasan en CI.

---

## TASK-097 — Implementar repository tests públicos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* findPublicTenantBySlug.
* getPublicBrandingBySlug.
* getPublicContactBySlug.
* getPublicLinksBySlug.
* Excluye tenants no activos.
* Excluye perfiles no visibles.
* Excluye Tenant B.

---

## TASK-098 — Implementar repository tests de mapping

**Estado:** `[ ] Pending`

### Criterios de aceptación

* getTenantWordPressMapping.
* updateTenantWordPressMapping.
* getPlatformWordPressMapping.
* updatePlatformWordPressMapping.
* unique wordpressSlug.
* unique tenantId.
* archived no expuesto.
* origin lookup.

---

## TASK-099 — Implementar repository tests de comunicados públicos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Solo si módulo de comunicados existe.
* Lista public/published.
* Excluye private.
* Excluye draft.
* Excluye Tenant B.
* Si no existe, queda diferido documentado.

---

## TASK-100 — Implementar repository tests de áreas comunales públicas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Solo si módulo de áreas comunales existe.
* Lista active/public.
* Excluye private.
* Excluye inactive.
* Excluye Tenant B.
* Si no existe, queda diferido documentado.

---

# 23. Fase 17 — Pruebas API

## TASK-101 — Implementar API tests de Public Tenant

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 slug activo visible.
* 404 slug inexistente.
* 422 slug inválido.
* 404 tenant suspendido.
* 404 perfil hidden.
* No requiere Authorization.
* Cache headers.
* Response shape.

---

## TASK-102 — Implementar API tests de Branding

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 slug válido.
* 422 slug inválido.
* 404 tenant no visible.
* No rutas internas.
* Colores válidos.
* Cache headers.

---

## TASK-103 — Implementar API tests de Contact

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 contacto institucional.
* No datos personales privados.
* Social links válidos.
* 404 tenant no visible.
* Cache headers.

---

## TASK-104 — Implementar API tests de Links

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 links válidos.
* No tokens en URLs.
* No session IDs.
* No URLs internas.
* 404 tenant no visible.

---

## TASK-105 — Implementar API tests de Announcements

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista públicos publicados.
* No lista privados.
* No lista draft.
* pageSize > 50 devuelve 422.
* Detalle público 200.
* Detalle privado 404.
* Tenant B no aparece.
* Si módulo diferido, contrato documentado.

---

## TASK-106 — Implementar API tests de Common Areas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista áreas públicas activas.
* No lista privadas.
* No lista inactivas.
* No expone disponibilidad privada.
* No permite reserva.
* Tenant B no aparece.
* Si módulo diferido, contrato documentado.

---

## TASK-107 — Implementar API tests de tenant mapping

**Estado:** `[ ] Pending`

### Criterios de aceptación

* GET autorizado 200.
* GET sin token 401.
* GET sin membership 403.
* GET sin permiso 403.
* PATCH autorizado 200.
* PATCH sin permiso 403.
* Slug inválido 422.
* URL inválida 422.
* Origin inválido 422.
* Slug duplicado 409.
* Body con secret 422.
* Audit event generado.

---

## TASK-108 — Implementar API tests de platform mapping

**Estado:** `[ ] Pending`

### Criterios de aceptación

* GET autorizado 200.
* GET sin token 401.
* GET sin permiso platform 403.
* Tenant inexistente 404.
* PATCH autorizado 200.
* PATCH sin permiso platform 403.
* Slug duplicado 409.
* URL insegura 422.
* Audit event generado.
* No guarda secretos.

---

# 24. Fase 18 — CORS, rate limiting y cache tests

## TASK-109 — Implementar CORS tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Origin permitido recibe header correcto.
* Origin no permitido bloqueado.
* Origin de Tenant B para slug A bloqueado.
* Wildcard producción rechazado.
* Origin null bloqueado.
* Origin con path inválido.
* Preflight GET público correcto.
* `Vary: Origin` presente.

---

## TASK-110 — Implementar rate limiting tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Requests bajo límite funcionan.
* Requests sobre límite devuelven 429.
* Endpoints detalle aplican límite reforzado.
* 429 incluye traceId.
* Métrica incrementa.
* No loggea payload completo.

---

## TASK-111 — Implementar cache header tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Public tenant cacheable.
* Branding cacheable.
* Contact cacheable.
* Links cacheable.
* 404 público TTL corto si aplica.
* Endpoint admin no public cache.
* ETag/Last-Modified si habilitado.
* No cachea datos privados.

---

# 25. Fase 19 — Authorization, multitenancy y seguridad

## TASK-112 — Implementar authorization tests públicos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint público funciona sin Authorization.
* No requiere cookies.
* No requiere sesión.
* Token inválido no habilita datos extra.

---

## TASK-113 — Implementar authorization tests tenant

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reader puede GET.
* Updater puede PATCH.
* Usuario sin permiso falla.
* Reader no puede PATCH.
* Usuario sin membership falla.
* Usuario disabled falla.

---

## TASK-114 — Implementar authorization tests platform

**Estado:** `[ ] Pending`

### Criterios de aceptación

* PlatformAdmin puede GET.
* PlatformAdmin puede PATCH.
* TenantAdmin no puede usar endpoint platform.
* Usuario sin permiso falla.
* Anonymous falla con 401.

---

## TASK-115 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Slug A devuelve Tenant A.
* Slug B devuelve Tenant B.
* Slug A no devuelve datos B.
* Branding A no incluye B.
* Contact A no incluye B.
* Announcement A no lista B.
* CommonArea A no lista B.
* TenantAdmin A no actualiza mapping B.
* Origin A no autoriza Tenant B.
* wordpressSlug duplicado falla.
* publicSlug duplicado falla.

---

## TASK-116 — Implementar tests de no exposición financiera

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Respuestas públicas no incluyen balance.
* No incluyen debt.
* No incluyen charges.
* No incluyen payments.
* No incluyen statements.
* No incluyen receipts.
* No incluyen delinquency.

---

## TASK-117 — Implementar tests de no exposición personal privada

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No resident names.
* No owner names.
* No personal emails.
* No personal phones.
* No identification numbers.
* No emergency contacts.
* No vehicle plates.
* No pet ownership details.

---

## TASK-118 — Implementar tests de no exposición interna

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No roles.
* No permissions.
* No audit_logs.
* No integrationStatus en DTO público.
* No wordpressAllowedOrigin en DTO público.
* No tenantId interno en DTO público.

---

## TASK-119 — Implementar tests de no secretos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No accessToken.
* No refreshToken.
* No apiKey.
* No clientSecret.
* No cookie.
* No Authorization header.
* Mapping update rechaza secretos.

---

## TASK-120 — Implementar negative behavior tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint público de pagos no existe.
* Endpoint público de saldos no existe.
* Endpoint público de estados de cuenta no existe.
* Endpoint público de comprobantes no existe.
* Endpoint público de escritura no existe.
* API pública no devuelve permisos.

---

# 26. Fase 20 — Auditoría, observabilidad y OpenAPI tests

## TASK-121 — Implementar audit integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant mapping update audita.
* Platform mapping update audita.
* Public profile update audita si aplica.
* Origin denied audita si aplica.
* Metadata no contiene tokens.
* Metadata no contiene payload completo.
* No audita cada visita ordinaria.

---

## TASK-122 — Implementar observability tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs técnicos se generan.
* Logs no contienen headers completos.
* Logs no contienen cookies.
* Logs no contienen tokens.
* Métricas incrementan.
* Métricas no usan slug.
* Métricas no usan tenantId.
* Métricas no usan ipAddress.

---

## TASK-123 — Implementar OpenAPI tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints públicos documentados.
* Endpoints tenant admin documentados.
* Endpoints platform documentados.
* `x-public-safe` presente.
* `x-no-financial-data` presente.
* `x-no-private-personal-data` presente.
* Permisos admin documentados.
* CORS/cache/rate limiting documentados.
* No endpoints públicos de pagos/saldos.
* No POST/PATCH/DELETE públicos.

---

# 27. Fase 21 — Compatibilidad WordPress

## TASK-124 — Validar consumo desde `single-conjunto.php`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Obtiene slug del CPT `conjunto`.
* Llama endpoint público Core.
* Usa respuesta 200 si existe.
* Usa ACF fallback si Core no responde.
* No usa credenciales privadas en navegador.
* No accede a DB Core.

---

## TASK-125 — Validar fallback ACF

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Fallback usa campos ACF existentes.
* No inventa datos financieros.
* No inventa datos personales privados.
* No muestra saldos/pagos/estados.
* Registra error técnico controlado si aplica.

---

## TASK-126 — Validar consumo desde JavaScript público

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Solo llama endpoints públicos.
* Origin permitido funciona.
* Origin no permitido bloquea.
* No envía cookies.
* No envía tokens.
* Respeta cache.

---

## TASK-127 — Validar mapeo ACF-Core

**Estado:** `[ ] Pending`

### Campos

```text id="b353pn"
logo -> logoUrl
banner_principal -> bannerUrl
color_primario -> primaryColor
color_secundario -> secondaryColor
slogan -> slogan
url_residentes -> residentPortalUrl
whatsapp -> publicWhatsapp
telefono -> publicPhone
email -> publicEmail
direccion -> publicAddress
facebook/instagram/youtube -> socialLinks
historia/mision/vision -> history/mission/vision
foto_1..foto_6 -> galleryUrls
```

### Criterios de aceptación

* Mapeo documentado.
* Campos visuales funcionan.
* Fallback controlado.
* No hay datos transaccionales.

---

# 28. Fase 22 — CI/CD y smoke tests

## TASK-128 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="h99trx"
npm run test:wordpress
npm run test:wordpress:unit
npm run test:wordpress:application
npm run test:wordpress:integration
npm run test:wordpress:api
npm run test:wordpress:cors
npm run test:wordpress:rate-limit
npm run test:wordpress:cache
npm run test:wordpress:authorization
npm run test:wordpress:multitenancy
npm run test:wordpress:security
npm run test:wordpress:openapi
```

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.

---

## TASK-129 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="x5837c"
lint
typecheck
unit tests
DTO validation tests
application tests
repository integration tests críticos
public API tests
tenant admin API tests
platform admin API tests
CORS tests
rate limit tests
cache tests
authorization tests
multitenancy tests
security exposure tests
audit integration tests
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay exposición financiera.
* Pipeline falla si hay exposición personal privada.
* Pipeline falla si hay CORS wildcard.
* Pipeline falla si faltan permisos admin.
* Pipeline falla si no hay tenant isolation.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-130 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="hu2ryt"
GET /api/v1/health
GET /api/v1/public/tenants/{slug-visible}
GET /api/v1/public/tenants/{slug-visible}/branding
GET /api/v1/public/tenants/{slug-visible}/contact
GET /api/v1/public/tenants/{slug-inexistente}
GET /api/v1/public/tenants/{slug-invalido}
GET /api/v1/tenant/integrations/wordpress sin token
CORS origin permitido
CORS origin no permitido
```

### Criterios de aceptación

* Smoke tests pasan.
* Errores incluyen traceId.
* No ejecutan operaciones peligrosas.
* No requieren datos reales.

---

# 29. Fase 23 — Revisión SDD

## TASK-131 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas.
* Cada endpoint público tiene API tests.
* Cada endpoint admin tiene authorization tests.
* Cada regla CORS tiene test.
* Cada regla de no exposición tiene test.
* Cada regla multitenant tiene test.
* Cada regla de cache/rate limit tiene test.

---

## TASK-132 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="edlz5a"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant isolation.
* RBAC para admin endpoints.
* observability.
* testing.
* CI gates.
* No se introducen decisiones contrarias a ADRs.

---

## TASK-133 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta endpoints públicos de escritura.
* No documenta endpoints públicos financieros.
* No documenta endpoints públicos de datos personales privados.
* Permisos admin documentados.
* CORS/cache/rate limiting documentados.
* OpenAPI valida.

---

## TASK-134 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash id="bxpncr"
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

## TASK-135 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="jsio2t"
- PR link o commit SHA.
- Endpoints implementados.
- Migración aplicada.
- Seeds demo.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 30. Fase 24 — Pendientes diferidos controlados

## TASK-136 — Diferir SSO completo con Keycloak

**Estado:** `[-] Deferred`

### Razón

Requiere flujo OIDC, sesión, redirecciones y portal autenticado.

### Futuro

```text id="a8zxyr"
docs/specs/00X-keycloak-sso/
```

---

## TASK-137 — Diferir login de residentes desde WordPress

**Estado:** `[-] Deferred`

### Razón

Depende de Keycloak/SSO y portal de residentes.

### Futuro

```text id="i5ltse"
docs/specs/00X-resident-portal-login/
```

---

## TASK-138 — Diferir pagos desde WordPress

**Estado:** `[-] Deferred`

### Razón

Requiere seguridad financiera, pasarela, comprobantes y autorización fuerte.

### Futuro

```text id="yyxtbu"
docs/specs/00X-wordpress-payments/
```

---

## TASK-139 — Diferir reservas desde WordPress

**Estado:** `[-] Deferred`

### Razón

Depende del módulo de reservas, calendario, reglas y autenticación.

### Futuro

```text id="rb84lp"
docs/specs/00X-wordpress-reservations/
```

---

## TASK-140 — Diferir plugin WordPress avanzado

**Estado:** `[-] Deferred`

### Razón

El MVP puede integrarse mediante plantilla y API pública.

### Futuro

```text id="s5pttu"
docs/specs/00X-wordpress-plugin/
```

---

## TASK-141 — Diferir bloques Gutenberg y shortcodes

**Estado:** `[-] Deferred`

### Razón

Requiere diseño de UX editorial y plugin propio.

### Futuro

```text id="qp11gc"
docs/specs/00X-wordpress-blocks-shortcodes/
```

---

## TASK-142 — Diferir sincronización bidireccional

**Estado:** `[-] Deferred`

### Razón

Requiere webhooks, reconciliación, colas, idempotencia y manejo de conflictos.

### Futuro

```text id="e60mtv"
docs/specs/00X-wordpress-sync/
```

---

## TASK-143 — Diferir cache invalidation avanzada

**Estado:** `[-] Deferred`

### Razón

MVP usa TTL corto; purge LiteSpeed y webhooks quedan para evolución.

### Futuro

```text id="fssie1"
docs/specs/00X-cache-invalidation/
```

---

## TASK-144 — Diferir GraphQL público

**Estado:** `[-] Deferred`

### Razón

MVP usará REST para simplicidad y compatibilidad.

### Futuro

```text id="dzza0m"
docs/specs/00X-public-graphql-api/
```

---

## TASK-145 — Diferir API keys servidor-servidor

**Estado:** `[-] Deferred`

### Razón

MVP no requiere integración privada server-to-server desde WordPress.

### Futuro

```text id="rg1hrd"
docs/specs/00X-integration-clients/
```

---

# 31. Definition of Done

El módulo `009-wordpress-integration-basic` estará terminado cuando:

```text id="cjnh6t"
[ ] Documentación completa.
[ ] Módulo wordpress-integration creado.
[ ] Migración creada y ejecutada.
[ ] tenant_public_profiles implementado.
[ ] tenant_wordpress_mappings implementado.
[ ] Seeds demo creados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] DTOs implementados.
[ ] Puertos implementados.
[ ] Repositorios implementados.
[ ] Servicios implementados.
[ ] Casos de uso implementados.
[ ] Guards/policies implementados.
[ ] PublicWordPressController implementado.
[ ] TenantWordPressIntegrationController implementado.
[ ] PlatformWordPressIntegrationController implementado.
[ ] GET public tenant implementado.
[ ] GET branding implementado.
[ ] GET contact implementado.
[ ] GET links implementado.
[ ] Endpoints announcements implementados o diferidos controladamente.
[ ] Endpoints common areas implementados o diferidos controladamente.
[ ] GET tenant mapping implementado.
[ ] PATCH tenant mapping implementado.
[ ] GET platform mapping implementado.
[ ] PATCH platform mapping implementado.
[ ] CORS restringido implementado.
[ ] Rate limiting implementado.
[ ] Cache headers implementados.
[ ] Auditoría de mapping implementada.
[ ] Logs sanitizados implementados.
[ ] Métricas implementadas.
[ ] OpenAPI actualizado.
[ ] No hay endpoints públicos de escritura.
[ ] No hay endpoints públicos financieros.
[ ] No hay endpoints públicos de datos personales privados.
[ ] No hay CORS wildcard en producción.
[ ] No se guardan tokens/secrets/cookies.
[ ] No hay acceso directo de WordPress a PostgreSQL.
[ ] Unit tests pasan.
[ ] DTO tests pasan.
[ ] Application tests pasan.
[ ] Repository integration tests pasan.
[ ] Public API tests pasan.
[ ] Admin API tests pasan.
[ ] CORS tests pasan.
[ ] Rate limit tests pasan.
[ ] Cache tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Security exposure tests pasan.
[ ] Audit integration tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Compatibility tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Diferidos documentados.
```

---

## 32. Orden recomendado de ejecución

```text id="qkcffp"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-018      Value objects
4. TASK-019 a TASK-027      Entidades, eventos y errores
5. TASK-028 a TASK-034      Base de datos, Prisma y seeds
6. TASK-035 a TASK-038      DTOs
7. TASK-039 a TASK-045      Puertos y repositorios
8. TASK-046 a TASK-054      Servicios
9. TASK-055 a TASK-066      Use cases
10. TASK-067 a TASK-074     Guards, policies y decorators
11. TASK-075 a TASK-077     Controladores
12. TASK-078 a TASK-079     Errores y responses
13. TASK-080 a TASK-082     CORS, cache y rate limit
14. TASK-083 a TASK-087     Auditoría y observabilidad
15. TASK-088 a TASK-091     OpenAPI
16. TASK-092 a TASK-123     Pruebas
17. TASK-124 a TASK-127     Compatibilidad WordPress
18. TASK-128 a TASK-130     CI/CD y smoke
19. TASK-131 a TASK-135     Revisión SDD
```

---

## 33. Riesgos de ejecución

| Riesgo                                | Impacto    | Mitigación                     |
| ------------------------------------- | ---------- | ------------------------------ |
| Exposición financiera pública         | Crítico    | public DTO allowlist + tests   |
| Exposición de datos personales        | Crítico    | field classification + tests   |
| CORS wildcard producción              | Alto       | CORS policy + tests            |
| Slug resuelve tenant incorrecto       | Crítico    | unique slug + MT tests         |
| WordPress accede a DB Core            | Crítico    | API-only + revisión PR         |
| Cache de datos privados               | Crítico    | cache policy + tests           |
| Mapping duplicado                     | Alto       | unique constraints + tests     |
| Origin inseguro                       | Alto       | WordPressOrigin VO             |
| URL insegura                          | Alto       | WordPressUrl VO                |
| Logs con tokens/cookies               | Alto       | logging tests                  |
| Rate limit ausente                    | Medio/alto | rate limit tests               |
| Se implementa plugin fuera de alcance | Medio      | diferidos controlados          |
| Se implementa SSO fuera de alcance    | Medio      | diferido a spec futura         |
| Endpoints públicos de escritura       | Crítico    | OpenAPI tests + negative tests |

---

## 34. Checklist de revisión de PR

```text id="cxqxyq"
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] No implementa SSO fuera de alcance.
[ ] No implementa pagos desde WordPress.
[ ] No implementa reservas desde WordPress.
[ ] No implementa plugin avanzado fuera de alcance.
[ ] No implementa GraphQL fuera de alcance.
[ ] WordPress no accede a PostgreSQL.
[ ] Endpoints públicos solo son GET.
[ ] Endpoints públicos no requieren auth.
[ ] Endpoints públicos validan slug.
[ ] Endpoints públicos aplican rate limiting.
[ ] Endpoints públicos aplican CORS seguro.
[ ] Endpoints públicos aplican cache seguro.
[ ] Endpoints públicos no exponen saldos.
[ ] Endpoints públicos no exponen pagos.
[ ] Endpoints públicos no exponen cargos.
[ ] Endpoints públicos no exponen estados de cuenta.
[ ] Endpoints públicos no exponen comprobantes.
[ ] Endpoints públicos no exponen nombres de residentes.
[ ] Endpoints públicos no exponen nombres de propietarios.
[ ] Endpoints públicos no exponen emails personales.
[ ] Endpoints públicos no exponen teléfonos personales.
[ ] Endpoints públicos no exponen identificaciones.
[ ] Endpoints públicos no exponen roles.
[ ] Endpoints públicos no exponen permisos.
[ ] Endpoints públicos no exponen audit_logs.
[ ] Tenant público se resuelve por slug único.
[ ] Tenant suspendido/inactivo/archivado no se publica.
[ ] Perfil hidden/draft/unpublished/archived no se publica.
[ ] CORS no usa wildcard en producción.
[ ] Mapping tenant requiere integrations.wordpress.read/update.
[ ] Mapping platform requiere permisos platform.
[ ] Mapping no acepta tenantId desde body tenant.
[ ] Mapping valida duplicidad.
[ ] Mapping valida URL.
[ ] Mapping valida origin.
[ ] Mapping rechaza tokens/secrets/cookies.
[ ] Cambios de mapping se auditan.
[ ] Logs no contienen headers completos.
[ ] Logs no contienen cookies.
[ ] Logs no contienen tokens.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan slug.
[ ] Métricas no usan ipAddress.
[ ] OpenAPI actualizado.
[ ] OpenAPI no documenta endpoints públicos financieros.
[ ] OpenAPI no documenta endpoints públicos de escritura.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests CORS pasan.
[ ] Tests multitenant pasan.
[ ] Tests seguridad pasan.
[ ] CI pasa.
```

---

## 35. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá una integración básica y segura con el portal WordPress multitenant, permitiendo que WordPress consuma información pública controlada sobre cada conjunto residencial mediante API REST.

El resultado esperado incluye:

```text id="y7uk7q"
- resolución de tenant público por slug;
- perfil público del conjunto;
- branding público;
- contacto institucional;
- enlaces públicos;
- mapping WordPress-Core;
- CORS restringido;
- rate limiting;
- cache público seguro;
- auditoría de configuración;
- compatibilidad con CPT conjunto y ACF;
- preparación para portal de residentes y SSO futuro.
```

La implementación no debe aceptarse si:

```text id="emz0lt"
WordPress accede directamente a PostgreSQL
WordPress recibe datos financieros
WordPress recibe datos personales privados
WordPress recibe tokens o secretos
CORS queda abierto con wildcard en producción
se mezclan tenants por slug
se cachea información privada
se crean endpoints públicos de escritura
se implementan pagos/reservas/SSO fuera de scope
WordPress se convierte en fuente transaccional
```

Antes de cerrar el paquete documental de `009-wordpress-integration-basic`, debe completarse:

```text id="lf9oty"
docs/specs/009-wordpress-integration-basic/security-notes.md
```
