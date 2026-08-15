# Test Plan — Spec 001 Tenants Management

> **Frontera vigente:** GAP-S2-006 retira los tests de `TenantConfiguration` y
> `/tenant/configuration`. Spec 001 prueba `timezone`/`currency` únicamente como campos
> de `Tenant`; las pruebas de settings y aislamiento de overrides pertenecen a Spec
> 025.

## 1. Información del documento

| Campo                    | Valor                                    |
| ------------------------ | ---------------------------------------- |
| Proyecto                 | RESIDENT Core                            |
| Spec ID                  | 001                                      |
| Módulo                   | Tenants Management                       |
| Documento                | Test Plan                                |
| Ruta                     | `docs/specs/001-tenants/test-plan.md`    |
| Versión                  | 0.1                                      |
| Estado                   | accepted                             |
| Fecha                    | 2026-07-12                               |
| Documento base           | `docs/specs/001-tenants/spec.md`         |
| Plan técnico             | `docs/specs/001-tenants/plan.md`         |
| Modelo de datos          | `docs/specs/001-tenants/data-model.md`   |
| Contrato API             | `docs/specs/001-tenants/api-contract.md` |
| Framework sugerido       | Jest + Supertest                         |
| Base de datos de pruebas | PostgreSQL test database                 |
| Prioridad                | Alta                                     |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `001-tenants`.

El objetivo es asegurar que el módulo cumpla con:

* especificación funcional;
* modelo de datos;
* contrato API;
* reglas de multitenancy;
* reglas de autorización;
* reglas de seguridad;
* auditoría;
* integración pública con WordPress;
* validación de errores;
* criterios de aceptación SDD.

Este plan debe ser usado por desarrolladores humanos y agentes IA antes de implementar o modificar el módulo.

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este test plan cubre:

* pruebas unitarias;
* pruebas de dominio;
* pruebas de value objects;
* pruebas de aplicación;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad;
* pruebas de contrato público para WordPress;
* pruebas de migración;
* pruebas de auditoría;
* pruebas de observabilidad mínima;
* pruebas de errores;
* pruebas de seeds;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* pruebas completas de usuarios y roles;
* pruebas reales de Keycloak;
* pruebas completas de pagos;
* pruebas de alícuotas;
* pruebas de residentes;
* pruebas de propiedades;
* pruebas de reservas;
* pruebas de multas;
* pruebas de reportes financieros;
* pruebas E2E con frontend real;
* pruebas de rendimiento avanzadas;
* pruebas de carga;
* pruebas de sincronización bidireccional con WordPress.

Estas pruebas se definirán en specs posteriores.

---

## 4. Estrategia general

El módulo `001-tenants` debe probarse en varias capas:

```text id="nws0xe"
Unit tests
Domain tests
Application tests
Integration tests
API tests
Authorization tests
Multitenancy tests
Security tests
Contract tests
Migration tests
Smoke tests
```

La estrategia sigue la decisión de `ADR-011-testing-strategy.md`.

Regla central:

```text id="bw5zsj"
Ninguna funcionalidad de 001-tenants se considera terminada si no tiene pruebas.
```

---

## 5. Criterios globales de aceptación de pruebas

La implementación cumple el test plan si:

* todos los value objects tienen pruebas unitarias;
* los cambios de estado tienen pruebas de dominio;
* los casos de uso críticos tienen pruebas de aplicación;
* la migración crea tablas, constraints e índices esperados;
* los endpoints privados requieren autenticación;
* los endpoints privados validan permisos;
* TenantAdmin no puede modificar tenant ajeno;
* PlatformAdmin puede operar globalmente según permisos;
* el endpoint público no expone datos sensibles;
* el endpoint público solo expone tenants activos;
* el slug es único;
* no existe eliminación física normal;
* las operaciones críticas generan auditoría;
* las operaciones críticas emiten eventos;
* los errores siguen el contrato estándar;
* los tests pasan en CI.

---

## 6. Datos de prueba base

### 6.1. Tenants

Se recomienda crear fixtures para:

```text id="qkotxk"
tenantActiveA
tenantActiveB
tenantPendingSetup
tenantSuspended
tenantInactive
tenantArchived
```

Ejemplos:

```text id="nynm1m"
tenantActiveA:
  name: Villa Club Demo
  slug: villa-club-demo
  status: active

tenantActiveB:
  name: Altos del Norte Demo
  slug: altos-del-norte-demo
  status: active

tenantPendingSetup:
  name: Jardines del Valle Demo
  slug: jardines-del-valle-demo
  status: pendingSetup

tenantSuspended:
  name: Tenant Suspendido Demo
  slug: tenant-suspendido-demo
  status: suspended

tenantArchived:
  name: Tenant Archivado Demo
  slug: tenant-archivado-demo
  status: archived
```

---

### 6.2. Usuarios simulados

Hasta que exista `002-users-roles`, se usarán usuarios simulados o fixtures de autorización.

Usuarios mínimos:

```text id="jc5u3o"
platformAdmin
platformOperator
platformSupport
tenantAdminA
tenantAdminB
tenantUserA
tenantUserB
userWithoutTenant
userWithoutPermission
anonymousUser
```

---

### 6.3. Permisos simulados

Permisos globales:

```text id="p1nzyh"
platform.tenants.create
platform.tenants.read
platform.tenants.update
platform.tenants.activate
platform.tenants.suspend
platform.tenants.reactivate
platform.tenants.archive
```

Permisos tenant:

```text id="8kaouz"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

---

### 6.4. Datos prohibidos en pruebas

No usar:

* cédulas reales;
* correos reales personales;
* teléfonos reales personales;
* comprobantes reales;
* datos bancarios;
* datos de residentes reales;
* tokens reales;
* claves reales;
* secretos reales.

---

## 7. Factories recomendadas

Crear factories para pruebas:

```text id="19w24j"
createTenant()
createTenantProfile()
createTenantBranding()
createTenantConfiguration()
createTenantWordPressMapping()
createPlatformAdminContext()
createTenantAdminContext()
createAnonymousContext()
createRequestContext()
```

Ejemplo conceptual:

```text id="t92c45"
createTenant({
  slug: "villa-club-demo",
  status: "active"
})
```

---

## 8. Pruebas unitarias

## 8.1. TenantSlug

Archivo sugerido:

```text id="t6d0ln"
tenant-slug.vo.spec.ts
```

Casos:

| ID          | Caso                                   | Resultado esperado           |
| ----------- | -------------------------------------- | ---------------------------- |
| UT-SLUG-001 | Normaliza `Villa Club`                 | `villa-club`                 |
| UT-SLUG-002 | Normaliza tildes                       | slug sin tildes              |
| UT-SLUG-003 | Rechaza slug vacío                     | error                        |
| UT-SLUG-004 | Rechaza slug con espacios              | error o normalización previa |
| UT-SLUG-005 | Rechaza slug con caracteres especiales | error                        |
| UT-SLUG-006 | Rechaza slug reservado `admin`         | error                        |
| UT-SLUG-007 | Rechaza slug con guion inicial         | error                        |
| UT-SLUG-008 | Rechaza slug con guion final           | error                        |
| UT-SLUG-009 | Rechaza guiones consecutivos           | error                        |
| UT-SLUG-010 | Acepta `altos-del-norte`               | válido                       |
| UT-SLUG-011 | Rechaza longitud menor a 3             | error                        |
| UT-SLUG-012 | Rechaza longitud mayor a 80            | error                        |

---

## 8.2. TenantStatus

Archivo sugerido:

```text id="o6aip0"
tenant-status.vo.spec.ts
```

Casos:

| ID            | Desde        | Hacia        | Resultado esperado           |
| ------------- | ------------ | ------------ | ---------------------------- |
| UT-STATUS-001 | pendingSetup | active       | permitido                    |
| UT-STATUS-002 | pendingSetup | inactive     | permitido                    |
| UT-STATUS-003 | active       | suspended    | permitido                    |
| UT-STATUS-004 | active       | inactive     | permitido                    |
| UT-STATUS-005 | suspended    | active       | permitido                    |
| UT-STATUS-006 | suspended    | archived     | permitido                    |
| UT-STATUS-007 | inactive     | active       | permitido                    |
| UT-STATUS-008 | inactive     | archived     | permitido                    |
| UT-STATUS-009 | active       | pendingSetup | rechazado                    |
| UT-STATUS-010 | suspended    | pendingSetup | rechazado                    |
| UT-STATUS-011 | archived     | active       | rechazado por defecto        |
| UT-STATUS-012 | active       | active       | rechazado o no-op controlado |

---

## 8.3. TenantCurrency

Archivo sugerido:

```text id="s7l4ia"
tenant-currency.vo.spec.ts
```

Casos:

| ID              | Caso            | Resultado esperado                         |
| --------------- | --------------- | ------------------------------------------ |
| UT-CURRENCY-001 | `USD`           | válido                                     |
| UT-CURRENCY-002 | vacío           | error                                      |
| UT-CURRENCY-003 | `EUR` en MVP    | error                                      |
| UT-CURRENCY-004 | lowercase `usd` | normalizar o rechazar según implementación |
| UT-CURRENCY-005 | valor inválido  | error                                      |

---

## 8.4. TenantTimezone

Archivo sugerido:

```text id="xmxcum"
tenant-timezone.vo.spec.ts
```

Casos:

| ID        | Caso                 | Resultado esperado  |
| --------- | -------------------- | ------------------- |
| UT-TZ-001 | `America/Guayaquil`  | válido              |
| UT-TZ-002 | vacío                | error               |
| UT-TZ-003 | timezone inexistente | error               |
| UT-TZ-004 | default no enviado   | `America/Guayaquil` |
| UT-TZ-005 | string aleatorio     | error               |

---

## 8.5. TenantColor

Archivo sugerido:

```text id="a376f0"
tenant-color.vo.spec.ts
```

Casos:

| ID           | Caso          | Resultado esperado       |
| ------------ | ------------- | ------------------------ |
| UT-COLOR-001 | `#1E88E5`     | válido                   |
| UT-COLOR-002 | `#fff`        | error en MVP             |
| UT-COLOR-003 | `blue`        | error                    |
| UT-COLOR-004 | `1E88E5`      | error                    |
| UT-COLOR-005 | `#ZZZZZZ`     | error                    |
| UT-COLOR-006 | null opcional | válido si campo opcional |

---

## 8.6. Tenant entity

Archivo sugerido:

```text id="km3fr9"
tenant.entity.spec.ts
```

Casos:

| ID            | Caso                               | Resultado esperado      |
| ------------- | ---------------------------------- | ----------------------- |
| UT-TENANT-001 | Crear Tenant válido                | entidad válida          |
| UT-TENANT-002 | Activar tenant pendingSetup válido | status active           |
| UT-TENANT-003 | Suspender tenant active con motivo | status suspended        |
| UT-TENANT-004 | Suspender sin motivo               | error                   |
| UT-TENANT-005 | Reactivar suspended                | status active           |
| UT-TENANT-006 | Archivar suspended                 | status archived         |
| UT-TENANT-007 | Operar tenant active               | permitido               |
| UT-TENANT-008 | Operar tenant suspended            | bloqueado               |
| UT-TENANT-009 | Operar tenant archived             | bloqueado               |
| UT-TENANT-010 | Cambiar slug de tenant active      | requiere regla especial |

---

## 9. Pruebas de aplicación

## 9.1. CreateTenantUseCase

Archivo sugerido:

```text id="ym3tzq"
create-tenant.use-case.spec.ts
```

Casos:

| ID             | Caso                                     | Resultado esperado                 |
| -------------- | ---------------------------------------- | ---------------------------------- |
| APP-CREATE-001 | Crear tenant con datos mínimos           | tenant pendingSetup creado         |
| APP-CREATE-002 | Crear tenant con profile                 | profile creado                     |
| APP-CREATE-003 | Crear tenant con branding                | branding creado                    |
| APP-CREATE-004 | Crear tenant con WordPress mapping       | mapping creado                     |
| APP-CREATE-005 | Crear tenant sin slug                    | slug generado                      |
| APP-CREATE-006 | Crear tenant con slug duplicado          | error `TENANT_SLUG_ALREADY_EXISTS` |
| APP-CREATE-007 | Crear tenant con slug reservado          | error `TENANT_INVALID_SLUG`        |
| APP-CREATE-008 | Crear tenant con timezone inválida       | error                              |
| APP-CREATE-009 | Crear tenant con currency inválida       | error                              |
| APP-CREATE-010 | Crear tenant registra auditoría          | audit event creado                 |
| APP-CREATE-011 | Crear tenant emite evento                | `TenantCreated` emitido            |
| APP-CREATE-012 | Crear tenant invoca puerto de roles base | `TenantBaseRolesPort` llamado      |

---

## 9.2. UpdateTenantUseCase

Casos:

| ID             | Caso                                        | Resultado esperado   |
| -------------- | ------------------------------------------- | -------------------- |
| APP-UPDATE-001 | Actualizar nombre                           | datos actualizados   |
| APP-UPDATE-002 | Actualizar timezone válido                  | actualizado          |
| APP-UPDATE-003 | Actualizar currency a USD                   | actualizado          |
| APP-UPDATE-004 | Actualizar currency inválida                | error                |
| APP-UPDATE-005 | Intentar cambiar status por update genérico | ignorado o rechazado |
| APP-UPDATE-006 | Tenant inexistente                          | `TENANT_NOT_FOUND`   |
| APP-UPDATE-007 | Registra auditoría                          | `tenant.updated`     |

---

## 9.3. ActivateTenantUseCase

Casos:

| ID          | Caso                             | Resultado esperado              |
| ----------- | -------------------------------- | ------------------------------- |
| APP-ACT-001 | Activar pendingSetup válido      | status active                   |
| APP-ACT-002 | Activar active                   | conflicto                       |
| APP-ACT-003 | Activar archived                 | error                           |
| APP-ACT-004 | Activar sin configuración mínima | error                           |
| APP-ACT-005 | Activar sin roles base           | error                           |
| APP-ACT-006 | Registra auditoría               | `tenant.activated`              |
| APP-ACT-007 | Emite evento                     | `TenantActivated`               |

---

## 9.4. SuspendTenantUseCase

Casos:

| ID           | Caso                        | Resultado esperado |
| ------------ | --------------------------- | ------------------ |
| APP-SUSP-001 | Suspender active con motivo | status suspended   |
| APP-SUSP-002 | Suspender sin motivo        | validation error   |
| APP-SUSP-003 | Suspender suspended         | conflicto          |
| APP-SUSP-004 | Suspender archived          | conflicto          |
| APP-SUSP-005 | Tenant inexistente          | `TENANT_NOT_FOUND` |
| APP-SUSP-006 | Registra actor              | `suspendedBy`      |
| APP-SUSP-007 | Registra auditoría          | `tenant.suspended` |
| APP-SUSP-008 | Emite evento                | `TenantSuspended`  |

---

## 9.5. ReactivateTenantUseCase

Casos:

| ID            | Caso                | Resultado esperado   |
| ------------- | ------------------- | -------------------- |
| APP-REACT-001 | Reactivar suspended | status active        |
| APP-REACT-002 | Reactivar inactive  | status active        |
| APP-REACT-003 | Reactivar active    | conflicto            |
| APP-REACT-004 | Reactivar archived  | error                |
| APP-REACT-005 | Registra auditoría  | `tenant.reactivated` |
| APP-REACT-006 | Emite evento        | `TenantReactivated`  |

---

## 9.6. ArchiveTenantUseCase

Casos:

| ID           | Caso                           | Resultado esperado                         |
| ------------ | ------------------------------ | ------------------------------------------ |
| APP-ARCH-001 | Archivar suspended             | status archived                            |
| APP-ARCH-002 | Archivar inactive              | status archived                            |
| APP-ARCH-003 | Archivar active según política | permitido o rechazado según implementación |
| APP-ARCH-004 | Archivar archived              | conflicto                                  |
| APP-ARCH-005 | No elimina físicamente         | registro persiste                          |
| APP-ARCH-006 | Registra actor                 | `archivedBy`                               |
| APP-ARCH-007 | Registra auditoría             | `tenant.archived`                          |
| APP-ARCH-008 | Emite evento                   | `TenantArchived`                           |

---

## 9.7. GetPublicTenantProfileUseCase

Casos:

| ID             | Caso                                                | Resultado esperado      |
| -------------- | --------------------------------------------------- | ----------------------- |
| APP-PUBLIC-001 | Tenant active por slug                              | devuelve perfil público |
| APP-PUBLIC-002 | Tenant inexistente                                  | `TENANT_NOT_FOUND`      |
| APP-PUBLIC-003 | Tenant pendingSetup                                 | no expuesto             |
| APP-PUBLIC-004 | Tenant suspended                                    | no expuesto             |
| APP-PUBLIC-005 | Tenant archived                                     | no expuesto             |
| APP-PUBLIC-006 | Respuesta no contiene campos internos               | pasa                    |
| APP-PUBLIC-007 | Access URL se devuelve correctamente                | pasa                    |
| APP-PUBLIC-008 | Mapping inactivo usa URL default o null según regla | pasa según contrato     |

---

## 10. Pruebas de integración

## 10.1. Migración y persistencia

Archivo sugerido:

```text id="9kjc07"
tenants.persistence.integration.spec.ts
```

Casos:

| ID         | Caso                                                   | Resultado esperado                 |
| ---------- | ------------------------------------------------------ | ---------------------------------- |
| INT-DB-001 | Migración crea `tenants`                               | tabla existe                       |
| INT-DB-002 | Migración crea `tenant_profiles`                       | tabla existe                       |
| INT-DB-003 | Migración crea `tenant_branding`                       | tabla existe                       |
| INT-DB-004 | Migración crea `tenant_configurations`                 | tabla existe                       |
| INT-DB-005 | Migración crea `tenant_wordpress_mappings`             | tabla existe                       |
| INT-DB-006 | `slug` es unique                                       | duplicado falla                    |
| INT-DB-007 | profile es 1:1                                         | segundo profile falla              |
| INT-DB-008 | branding es 1:1                                        | segundo branding falla             |
| INT-DB-009 | configuration es 1:1                                   | segunda configuration falla        |
| INT-DB-010 | wordpress mapping es 1:1                               | segundo mapping falla              |
| INT-DB-011 | onDelete Restrict evita eliminar tenant con relaciones | delete falla                       |
| INT-DB-012 | defaults correctos                                     | status/timezone/currency correctos |

---

## 10.2. Repositorio Prisma

Archivo sugerido:

```text id="6adqjl"
prisma-tenant.repository.integration.spec.ts
```

Casos:

| ID           | Caso                                 | Resultado esperado            |
| ------------ | ------------------------------------ | ----------------------------- |
| INT-REPO-001 | `create` crea tenant completo        | registro y relaciones creadas |
| INT-REPO-002 | `findById` devuelve detalle          | detalle correcto              |
| INT-REPO-003 | `findBySlug` devuelve tenant         | tenant correcto               |
| INT-REPO-004 | `existsBySlug` detecta existente     | true                          |
| INT-REPO-005 | `list` pagina resultados             | meta correcto                 |
| INT-REPO-006 | `list` filtra por status             | resultados correctos          |
| INT-REPO-007 | `list` busca por search              | resultados correctos          |
| INT-REPO-008 | `update` actualiza campos permitidos | persistido                    |
| INT-REPO-009 | `suspend` setea campos de suspensión | persistido                    |
| INT-REPO-010 | `archive` setea campos de archivado  | persistido                    |

---

## 10.3. Transacción de creación

Casos:

| ID         | Caso                                               | Resultado esperado      |
| ---------- | -------------------------------------------------- | ----------------------- |
| INT-TX-001 | Crear tenant completo exitoso                      | todo persiste           |
| INT-TX-002 | Falla creación de profile                          | rollback total          |
| INT-TX-003 | Falla creación de configuration                    | rollback total          |
| INT-TX-004 | Falla creación de roles base                       | rollback total          |
| INT-TX-005 | Falla creación de membership o TenantAdmin         | rollback total          |
| INT-TX-006 | Falla auditoría durable                            | rollback total          |

---

## 11. Pruebas API

## 11.1. Platform API — listar tenants

Endpoint:

```text id="3yl296"
GET /api/v1/platform/tenants
```

Casos:

| ID           | Caso                        | Resultado esperado  |
| ------------ | --------------------------- | ------------------- |
| API-LIST-001 | PlatformAdmin lista tenants | 200                 |
| API-LIST-002 | Sin token                   | 401                 |
| API-LIST-003 | Sin permiso                 | 403                 |
| API-LIST-004 | Paginación default          | page 1, pageSize 20 |
| API-LIST-005 | pageSize mayor a máximo     | 422 o limitado      |
| API-LIST-006 | Filtrar por active          | solo active         |
| API-LIST-007 | Buscar por slug             | resultado correcto  |
| API-LIST-008 | Ordenar por name asc        | orden correcto      |

---

## 11.2. Platform API — crear tenant

Endpoint:

```text id="zgrezp"
POST /api/v1/platform/tenants
```

Casos:

| ID             | Caso                        | Resultado esperado |
| -------------- | --------------------------- | ------------------ |
| API-CREATE-001 | Crear tenant válido         | 201                |
| API-CREATE-002 | Crear sin name              | 422                |
| API-CREATE-003 | Crear slug duplicado        | 409                |
| API-CREATE-004 | Crear slug inválido         | 422                |
| API-CREATE-005 | Crear slug reservado        | 422                |
| API-CREATE-006 | Crear con timezone inválida | 422                |
| API-CREATE-007 | Crear con currency no USD   | 422                |
| API-CREATE-008 | Crear con color inválido    | 422                |
| API-CREATE-009 | Crear con URL inválida      | 422                |
| API-CREATE-010 | Sin token                   | 401                |
| API-CREATE-011 | Token sin permiso           | 403                |
| API-CREATE-012 | Respuesta incluye traceId   | pasa               |
| API-CREATE-013 | Auditoría generada          | pasa               |
| API-CREATE-014 | Evento generado             | pasa               |

---

## 11.3. Platform API — consultar por ID

Endpoint:

```text id="n2vojk"
GET /api/v1/platform/tenants/{tenantId}
```

Casos:

| ID          | Caso                | Resultado esperado |
| ----------- | ------------------- | ------------------ |
| API-GET-001 | ID válido           | 200                |
| API-GET-002 | ID inexistente      | 404                |
| API-GET-003 | ID formato inválido | 400/422            |
| API-GET-004 | Sin token           | 401                |
| API-GET-005 | Sin permiso         | 403                |

---

## 11.4. Platform API — actualizar tenant

Endpoint:

```text id="686sfa"
PATCH /api/v1/platform/tenants/{tenantId}
```

Casos:

| ID          | Caso                            | Resultado esperado   |
| ----------- | ------------------------------- | -------------------- |
| API-UPD-001 | Actualizar campos permitidos    | 200                  |
| API-UPD-002 | Actualizar tenant inexistente   | 404                  |
| API-UPD-003 | Enviar status en PATCH genérico | rechazado o ignorado |
| API-UPD-004 | Currency inválida               | 422                  |
| API-UPD-005 | Timezone inválida               | 422                  |
| API-UPD-006 | Sin token                       | 401                  |
| API-UPD-007 | Sin permiso                     | 403                  |
| API-UPD-008 | Auditoría generada              | pasa                 |

---

## 11.5. Platform API — activar tenant

Endpoint:

```text id="348ai4"
POST /api/v1/platform/tenants/{tenantId}/activate
```

Casos:

| ID          | Caso                        | Resultado esperado |
| ----------- | --------------------------- | ------------------ |
| API-ACT-001 | Activar pendingSetup válido | 200                |
| API-ACT-002 | Activar active              | 409                |
| API-ACT-003 | Activar archived            | 409                |
| API-ACT-004 | Tenant inexistente          | 404                |
| API-ACT-005 | Sin permiso                 | 403                |
| API-ACT-006 | Auditoría generada          | pasa               |
| API-ACT-007 | Evento emitido              | pasa               |

---

## 11.6. Platform API — suspender tenant

Endpoint:

```text id="ja0z0l"
POST /api/v1/platform/tenants/{tenantId}/suspend
```

Casos:

| ID           | Caso                          | Resultado esperado |
| ------------ | ----------------------------- | ------------------ |
| API-SUSP-001 | Suspender active con motivo   | 200                |
| API-SUSP-002 | Suspender sin motivo          | 422                |
| API-SUSP-003 | Suspender suspended           | 409                |
| API-SUSP-004 | Suspender archived            | 409                |
| API-SUSP-005 | Tenant inexistente            | 404                |
| API-SUSP-006 | Sin permiso                   | 403                |
| API-SUSP-007 | `suspensionReason` persistido | pasa               |
| API-SUSP-008 | Auditoría generada            | pasa               |
| API-SUSP-009 | Evento emitido                | pasa               |

---

## 11.7. Platform API — reactivar tenant

Endpoint:

```text id="u8fjdo"
POST /api/v1/platform/tenants/{tenantId}/reactivate
```

Casos:

| ID            | Caso                | Resultado esperado |
| ------------- | ------------------- | ------------------ |
| API-REACT-001 | Reactivar suspended | 200                |
| API-REACT-002 | Reactivar inactive  | 200                |
| API-REACT-003 | Reactivar active    | 409                |
| API-REACT-004 | Reactivar archived  | 409                |
| API-REACT-005 | Sin permiso         | 403                |
| API-REACT-006 | Auditoría generada  | pasa               |
| API-REACT-007 | Evento emitido      | pasa               |

---

## 11.8. Platform API — archivar tenant

Endpoint:

```text id="waipf6"
POST /api/v1/platform/tenants/{tenantId}/archive
```

Casos:

| ID           | Caso                   | Resultado esperado |
| ------------ | ---------------------- | ------------------ |
| API-ARCH-001 | Archivar suspended     | 200                |
| API-ARCH-002 | Archivar inactive      | 200                |
| API-ARCH-003 | Archivar archived      | 409                |
| API-ARCH-004 | Sin permiso            | 403                |
| API-ARCH-005 | No elimina físicamente | pasa               |
| API-ARCH-006 | Auditoría generada     | pasa               |
| API-ARCH-007 | Evento emitido         | pasa               |

---

## 12. Pruebas Active Tenant API

## 12.1. Consultar perfil

Endpoint:

```text id="qj5s32"
GET /api/v1/tenant/profile
```

Casos:

| ID                  | Caso                            | Resultado esperado                      |
| ------------------- | ------------------------------- | --------------------------------------- |
| API-PROFILE-GET-001 | TenantAdmin A consulta perfil A | 200                                     |
| API-PROFILE-GET-002 | Sin token                       | 401                                     |
| API-PROFILE-GET-003 | Sin `X-Tenant-Id`               | 400 `TENANT_CONTEXT_REQUIRED`           |
| API-PROFILE-GET-004 | Sin permiso                     | 403                                     |
| API-PROFILE-GET-005 | Tenant suspendido               | 403 o permitido limitado según política |

---

## 12.2. Actualizar perfil

Endpoint:

```text id="4n7j3e"
PATCH /api/v1/tenant/profile
```

Casos:

| ID                  | Caso                             | Resultado esperado |
| ------------------- | -------------------------------- | ------------------ |
| API-PROFILE-UPD-001 | TenantAdmin A actualiza perfil A | 200                |
| API-PROFILE-UPD-002 | TenantAdmin B no actualiza A     | 403/404            |
| API-PROFILE-UPD-003 | Sin permiso                      | 403                |
| API-PROFILE-UPD-004 | Email inválido                   | 422                |
| API-PROFILE-UPD-005 | Campo requerido vacío            | 422                |
| API-PROFILE-UPD-006 | Auditoría generada               | pasa               |

---

## 12.3. Consultar branding

Endpoint:

```text id="2ydloo"
GET /api/v1/tenant/branding
```

Casos:

| ID                | Caso                | Resultado esperado |
| ----------------- | ------------------- | ------------------ |
| API-BRAND-GET-001 | Consulta autorizada | 200                |
| API-BRAND-GET-002 | Sin token           | 401                |
| API-BRAND-GET-003 | Sin permiso         | 403                |
| API-BRAND-GET-004 | Sin `X-Tenant-Id`   | 400 `TENANT_CONTEXT_REQUIRED` |

---

## 12.4. Actualizar branding

Endpoint:

```text id="y8zcqf"
PATCH /api/v1/tenant/branding
```

Casos:

| ID                | Caso                       | Resultado esperado |
| ----------------- | -------------------------- | ------------------ |
| API-BRAND-UPD-001 | Actualizar branding válido | 200                |
| API-BRAND-UPD-002 | Color inválido             | 422                |
| API-BRAND-UPD-003 | URL inválida               | 422                |
| API-BRAND-UPD-004 | URL HTTP en producción     | 422                |
| API-BRAND-UPD-005 | Sin permiso                | 403                |
| API-BRAND-UPD-006 | Auditoría generada         | pasa               |

---

## 12.5. Consultar configuración

Endpoint:

```text id="fc4y8g"
GET /api/v1/tenant/configuration
```

Casos:

| ID               | Caso                | Resultado esperado |
| ---------------- | ------------------- | ------------------ |
| API-CONF-GET-001 | Consulta autorizada | 200                |
| API-CONF-GET-002 | Sin token           | 401                |
| API-CONF-GET-003 | Sin permiso         | 403                |
| API-CONF-GET-004 | Sin `X-Tenant-Id`   | 400 `TENANT_CONTEXT_REQUIRED` |

---

## 12.6. Actualizar configuración

Endpoint:

```text id="ey8qlr"
PATCH /api/v1/tenant/configuration
```

Casos:

| ID               | Caso                         | Resultado esperado     |
| ---------------- | ---------------------------- | ---------------------- |
| API-CONF-UPD-001 | Actualizar flags válidos     | 200                    |
| API-CONF-UPD-002 | Currency no USD              | 422                    |
| API-CONF-UPD-003 | Timezone inválida            | 422                    |
| API-CONF-UPD-004 | Activar módulo no disponible | rechazado o controlado |
| API-CONF-UPD-005 | Sin permiso                  | 403                    |
| API-CONF-UPD-006 | Auditoría generada           | pasa                   |

---

## 12.7. Actualizar WordPress mapping

Endpoint:

```text id="2fgmxf"
PATCH /api/v1/tenant/wordpress-mapping
```

Casos:

| ID             | Caso                      | Resultado esperado |
| -------------- | ------------------------- | ------------------ |
| API-WP-UPD-001 | Actualizar mapping válido | 200                |
| API-WP-UPD-002 | wordpressSiteUrl inválida | 422                |
| API-WP-UPD-003 | accessUrl inválida        | 422                |
| API-WP-UPD-004 | slug WordPress inválido   | 422                |
| API-WP-UPD-005 | Sin permiso               | 403                |
| API-WP-UPD-006 | Auditoría generada        | pasa               |

---

## 13. Pruebas Public API

## 13.1. Consultar perfil público

Endpoint:

```text id="d8yryu"
GET /api/v1/public/tenants/{slug}
```

Casos:

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| API-PUBLIC-001 | Slug active válido            | 200                |
| API-PUBLIC-002 | Slug inexistente              | 404                |
| API-PUBLIC-003 | Slug inválido                 | 422                |
| API-PUBLIC-004 | Tenant pendingSetup           | 404                |
| API-PUBLIC-005 | Tenant suspended              | 404                |
| API-PUBLIC-006 | Tenant inactive               | 404                |
| API-PUBLIC-007 | Tenant archived               | 404                |
| API-PUBLIC-008 | No requiere token             | 200 para active    |
| API-PUBLIC-009 | Respuesta tiene traceId       | pasa               |
| API-PUBLIC-010 | No expone `id` interno        | pasa               |
| API-PUBLIC-011 | No expone `planCode`          | pasa               |
| API-PUBLIC-012 | No expone `status` interno    | pasa               |
| API-PUBLIC-013 | No expone configuración       | pasa               |
| API-PUBLIC-014 | No expone roles/permisos      | pasa               |
| API-PUBLIC-015 | No expone usuarios            | pasa               |
| API-PUBLIC-016 | No expone auditoría           | pasa               |
| API-PUBLIC-017 | Devuelve `accessUrl` correcto | pasa               |
| API-PUBLIC-018 | Rate limit aplica             | 429 al exceder     |

---

## 14. Pruebas de autorización

## 14.1. Platform permissions

| ID            | Usuario                          | Endpoint              | Resultado |
| ------------- | -------------------------------- | --------------------- | --------- |
| AUTH-PLAT-001 | PlatformAdmin con permiso create | POST tenants          | 201       |
| AUTH-PLAT-002 | PlatformAdmin sin create         | POST tenants          | 403       |
| AUTH-PLAT-003 | TenantAdmin                      | POST platform tenants | 403       |
| AUTH-PLAT-004 | Anonymous                        | GET platform tenants  | 401       |
| AUTH-PLAT-005 | PlatformSupport read-only        | GET platform tenants  | 200       |
| AUTH-PLAT-006 | PlatformSupport read-only        | POST suspend          | 403       |

---

## 14.2. Tenant permissions

| ID           | Usuario                               | Endpoint        | Resultado |
| ------------ | ------------------------------------- | --------------- | --------- |
| AUTH-TEN-001 | TenantAdmin A con profile.update      | PATCH profile A | 200       |
| AUTH-TEN-002 | TenantAdmin A sin profile.update      | PATCH profile A | 403       |
| AUTH-TEN-003 | TenantUser A sin permiso              | PATCH profile A | 403       |
| AUTH-TEN-004 | TenantAdmin A intenta operar tenant B | PATCH profile B | 403/404   |
| AUTH-TEN-005 | User sin tenant activo                | GET profile     | 403       |
| AUTH-TEN-006 | Token válido sin membership           | GET profile     | 403       |

---

## 15. Pruebas multitenant

### 15.1. Aislamiento de actualización

| ID     | Caso                                        | Resultado esperado |
| ------ | ------------------------------------------- | ------------------ |
| MT-001 | TenantAdmin A actualiza perfil A            | 200                |
| MT-002 | TenantAdmin A intenta actualizar perfil B   | 403/404            |
| MT-003 | TenantAdmin A actualiza branding A          | solo A cambia      |
| MT-004 | TenantAdmin A intenta actualizar branding B | B no cambia        |
| MT-005 | TenantAdmin A actualiza configuration A     | solo A cambia      |
| MT-006 | TenantAdmin A intenta actualizar mapping B  | B no cambia        |

---

### 15.2. Aislamiento de lectura

| ID          | Caso                                        | Resultado esperado    |
| ----------- | ------------------------------------------- | --------------------- |
| MT-READ-001 | TenantAdmin A lee profile A                 | 200                   |
| MT-READ-002 | TenantAdmin A intenta leer datos internos B | 403/404               |
| MT-READ-003 | Public endpoint A no muestra B              | pasa                  |
| MT-READ-004 | Lista platform solo para usuario global     | TenantAdmin no accede |

---

### 15.3. Aislamiento de auditoría

| ID           | Caso                                                                     | Resultado esperado |
| ------------ | ------------------------------------------------------------------------ | ------------------ |
| MT-AUDIT-001 | Cambio en tenant A registra tenantId A                                   | pasa               |
| MT-AUDIT-002 | Intento de cambio en tenant B por usuario A se audita si política aplica | pasa               |
| MT-AUDIT-003 | Auditoría no mezcla tenantId                                             | pasa               |

---

## 16. Pruebas de seguridad

## 16.1. Validación de payload

| ID              | Caso                            | Resultado esperado              |
| --------------- | ------------------------------- | ------------------------------- |
| SEC-PAYLOAD-001 | Payload con campos desconocidos | ignorado o rechazado según DTO  |
| SEC-PAYLOAD-002 | Payload excesivo                | 413/422                         |
| SEC-PAYLOAD-003 | Strings muy largos              | 422                             |
| SEC-PAYLOAD-004 | HTML/script en slogan           | sanitizado o tratado como texto |
| SEC-PAYLOAD-005 | SQL-like input en search        | no inyección                    |
| SEC-PAYLOAD-006 | NoSQL-like payload              | rechazado/ignorado              |

---

## 16.2. Endpoint público

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| SEC-PUBLIC-001 | No expone datos internos      | pasa               |
| SEC-PUBLIC-002 | No expone tenant no active    | 404                |
| SEC-PUBLIC-003 | Rate limit aplica             | 429                |
| SEC-PUBLIC-004 | CORS solo orígenes permitidos | pasa               |
| SEC-PUBLIC-005 | Error no revela stack trace   | pasa               |

---

## 16.3. URLs

| ID          | Caso                              | Resultado esperado                         |
| ----------- | --------------------------------- | ------------------------------------------ |
| SEC-URL-001 | URL HTTPS válida                  | aceptada                                   |
| SEC-URL-002 | URL HTTP en producción            | rechazada                                  |
| SEC-URL-003 | URL javascript                    | rechazada                                  |
| SEC-URL-004 | URL file                          | rechazada                                  |
| SEC-URL-005 | URL localhost en producción       | rechazada                                  |
| SEC-URL-006 | URL interna privada en producción | rechazada si se implementa SSRF protection |

---

## 16.4. Logs

| ID          | Caso                                    | Resultado esperado |
| ----------- | --------------------------------------- | ------------------ |
| SEC-LOG-001 | Authorization header no aparece en logs | pasa               |
| SEC-LOG-002 | Token no aparece en logs                | pasa               |
| SEC-LOG-003 | Error incluye traceId                   | pasa               |
| SEC-LOG-004 | Stack trace no aparece en producción    | pasa               |

---

## 17. Pruebas de contrato para WordPress

Endpoint:

```text id="df6c62"
GET /api/v1/public/tenants/{slug}
```

### 17.1. Contrato mínimo

La respuesta debe incluir:

```text id="i3ym2n"
slug
displayName
slogan
description
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
contact
accessUrl
```

### 17.2. Casos

| ID              | Caso                           | Resultado esperado |
| --------------- | ------------------------------ | ------------------ |
| CONTRACT-WP-001 | WordPress consulta slug active | contrato válido    |
| CONTRACT-WP-002 | Campos requeridos presentes    | pasa               |
| CONTRACT-WP-003 | Campos prohibidos ausentes     | pasa               |
| CONTRACT-WP-004 | accessUrl usable               | pasa               |
| CONTRACT-WP-005 | colores en formato hex         | pasa               |
| CONTRACT-WP-006 | imágenes URL string/null       | pasa               |
| CONTRACT-WP-007 | slug inexistente               | error estándar 404 |
| CONTRACT-WP-008 | CORS permite portal WordPress  | pasa               |

---

## 18. Pruebas de auditoría

| ID      | Operación                    | Evento esperado                   |
| ------- | ---------------------------- | --------------------------------- |
| AUD-001 | Crear tenant                 | `tenant.created`                  |
| AUD-002 | Crear acceso inicial completo | `tenant.baseRoles.created`        |
| AUD-003 | Actualizar tenant            | `tenant.updated`                  |
| AUD-004 | Activar tenant               | `tenant.activated`                |
| AUD-005 | Suspender tenant             | `tenant.suspended`                |
| AUD-006 | Reactivar tenant             | `tenant.reactivated`              |
| AUD-007 | Archivar tenant              | `tenant.archived`                 |
| AUD-008 | Actualizar profile           | `tenant.profile.updated`          |
| AUD-009 | Actualizar branding          | `tenant.branding.updated`         |
| AUD-010 | Actualizar configuration     | `tenant.configuration.updated`    |
| AUD-011 | Actualizar WordPress mapping | `tenant.wordpressMapping.updated` |

Cada auditoría debe incluir:

```text id="x0jfsm"
tenantId
actorUserId
action
resourceType
resourceId
result
traceId
occurredAt
```

---

## 19. Pruebas de eventos

| ID      | Operación                | Evento esperado                 |
| ------- | ------------------------ | ------------------------------- |
| EVT-001 | Crear tenant             | `TenantCreated`                 |
| EVT-002 | Crear roles base         | `TenantBaseRolesCreated`        |
| EVT-003 | Activar tenant           | `TenantActivated`               |
| EVT-004 | Suspender tenant         | `TenantSuspended`               |
| EVT-005 | Reactivar tenant         | `TenantReactivated`             |
| EVT-006 | Archivar tenant          | `TenantArchived`                |
| EVT-007 | Actualizar profile       | `TenantProfileUpdated`          |
| EVT-008 | Actualizar branding      | `TenantBrandingUpdated`         |
| EVT-009 | Actualizar configuration | `TenantConfigurationUpdated`    |
| EVT-010 | Actualizar mapping       | `TenantWordPressMappingUpdated` |

---

## 20. Pruebas de observabilidad

| ID      | Caso                            | Resultado esperado            |
| ------- | ------------------------------- | ----------------------------- |
| OBS-001 | Request privado exitoso         | log con traceId               |
| OBS-002 | Request privado fallido         | error log con traceId         |
| OBS-003 | Request público exitoso         | métrica incrementada          |
| OBS-004 | Request público fallido         | métrica de error incrementada |
| OBS-005 | Error estándar devuelve traceId | pasa                          |
| OBS-006 | Auditoría contiene traceId      | pasa                          |
| OBS-007 | Logs no contienen token         | pasa                          |

Métricas esperadas:

```text id="7e4gq1"
tenants_created_total
tenants_activated_total
tenants_suspended_total
tenants_reactivated_total
tenants_archived_total
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

---

## 21. Pruebas de migración

Archivo sugerido:

```text id="k9nqmv"
001_create_tenants.migration.spec.ts
```

Casos:

| ID      | Caso                                  | Resultado esperado |
| ------- | ------------------------------------- | ------------------ |
| MIG-001 | Migración aplica en DB limpia         | éxito              |
| MIG-002 | Prisma Client genera correctamente    | éxito              |
| MIG-003 | Enum TenantStatus existe              | éxito              |
| MIG-004 | Índice unique slug existe             | éxito              |
| MIG-005 | Índices secundarios existen           | éxito              |
| MIG-006 | onDelete Restrict configurado         | éxito              |
| MIG-007 | Rollback o reset local funciona       | éxito              |
| MIG-008 | Migración no crea cascades peligrosos | éxito              |

---

## 22. Pruebas de seeds

| ID       | Caso                                   | Resultado esperado       |
| -------- | -------------------------------------- | ------------------------ |
| SEED-001 | Seed crea tenants demo                 | éxito                    |
| SEED-002 | Seed es idempotente o controlado       | no duplica indebidamente |
| SEED-003 | Seed no usa datos reales               | pasa                     |
| SEED-004 | Tenant activo demo tiene profile       | pasa                     |
| SEED-005 | Tenant activo demo tiene configuration | pasa                     |
| SEED-006 | Tenant suspendido demo tiene motivo    | pasa                     |

---

## 23. Smoke tests

Smoke tests post-deploy para este módulo:

| ID        | Caso                                         | Resultado esperado |
| --------- | -------------------------------------------- | ------------------ |
| SMOKE-001 | `GET /api/v1/health`                         | 200                |
| SMOKE-002 | `GET /api/v1/public/tenants/villa-club-demo` | 200 si seed existe |
| SMOKE-003 | `GET /api/v1/public/tenants/no-existe`       | 404                |
| SMOKE-004 | Endpoint privado sin token                   | 401                |
| SMOKE-005 | DB responde                                  | health OK          |
| SMOKE-006 | API devuelve traceId                         | pasa               |

No ejecutar operaciones destructivas en producción.

---

## 24. Pruebas de errores estándar

Cada error debe seguir este formato:

```json id="qmdsqh"
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "The requested tenant was not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

Casos:

| ID      | Caso                | Error esperado                     |
| ------- | ------------------- | ---------------------------------- |
| ERR-001 | Tenant inexistente  | `TENANT_NOT_FOUND`                 |
| ERR-002 | Slug duplicado      | `TENANT_SLUG_ALREADY_EXISTS`       |
| ERR-003 | Slug inválido       | `TENANT_INVALID_SLUG`              |
| ERR-004 | Transición inválida | `TENANT_STATUS_TRANSITION_INVALID` |
| ERR-005 | Timezone inválida   | `TENANT_INVALID_TIMEZONE`          |
| ERR-006 | Currency inválida   | `TENANT_INVALID_CURRENCY`          |
| ERR-007 | Color inválido      | `TENANT_INVALID_COLOR`             |
| ERR-008 | URL inválida        | `TENANT_INVALID_URL`               |
| ERR-009 | Sin permiso         | `FORBIDDEN`                        |
| ERR-010 | Sin token           | `UNAUTHORIZED`                     |

---

## 25. Pruebas de OpenAPI

Validar que OpenAPI incluya:

* todos los endpoints;
* request schemas;
* response schemas;
* error schemas;
* security schemes;
* permisos en extensión o descripción;
* ejemplos;
* tags;
* status codes;
* endpoint público marcado como público;
* endpoint público marcado con rate limit.

Casos:

| ID       | Caso                                  | Resultado esperado |
| -------- | ------------------------------------- | ------------------ |
| OAPI-001 | OpenAPI contiene Platform Tenants API | pasa               |
| OAPI-002 | OpenAPI contiene Active Tenant API    | pasa               |
| OAPI-003 | OpenAPI contiene Public Tenants API   | pasa               |
| OAPI-004 | POST create tenant tiene schema       | pasa               |
| OAPI-005 | Errores estándar documentados         | pasa               |
| OAPI-006 | Permisos documentados                 | pasa               |
| OAPI-007 | Endpoint público sin auth             | pasa               |
| OAPI-008 | Endpoints privados con auth           | pasa               |

---

## 26. Pruebas de regresión obligatorias

Cada bug futuro en este módulo debe generar prueba de regresión.

Ejemplos de bugs que deben producir test:

* tenant duplicado por carrera;
* endpoint público expone `id`;
* TenantAdmin modifica otro tenant;
* suspended tenant aparece públicamente;
* cambio de status por PATCH genérico;
* slug reservado aceptado;
* URL insegura aceptada;
* auditoría omitida;
* evento no emitido;
* migración rompe constraints.

---

## 27. Pruebas de concurrencia básica

Casos mínimos:

| ID       | Caso                                             | Resultado esperado                       |
| -------- | ------------------------------------------------ | ---------------------------------------- |
| CONC-001 | Crear dos tenants con mismo slug simultáneamente | uno crea, otro falla 409                 |
| CONC-002 | Suspender y reactivar simultáneamente            | estado final consistente                 |
| CONC-003 | Actualizar profile simultáneamente               | último write controlado o versión futura |
| CONC-004 | Consultar público durante suspensión             | no expone si ya suspendido               |

Para MVP basta con validar constraints y estado final razonable.

---

## 28. Pruebas de idempotencia

Este módulo no requiere idempotencia completa en todos los endpoints, pero se recomienda evaluar:

| ID        | Caso                                 | Resultado esperado      |
| --------- | ------------------------------------ | ----------------------- |
| IDEMP-001 | Repetir create tenant con mismo slug | 409                     |
| IDEMP-002 | Repetir activate tenant ya active    | 409 o no-op documentado |
| IDEMP-003 | Repetir suspend tenant ya suspended  | 409                     |
| IDEMP-004 | Repetir archive tenant ya archived   | 409                     |

Si se adopta `Idempotency-Key` en creación, deberá documentarse como extensión futura.

---

## 29. Pruebas de performance básica

No se requiere carga avanzada.

Casos mínimos:

| ID       | Caso                      | Criterio inicial                    |
| -------- | ------------------------- | ----------------------------------- |
| PERF-001 | Listar tenants paginado   | respuesta razonable con 100 tenants |
| PERF-002 | Buscar por slug           | usa índice                          |
| PERF-003 | Endpoint público por slug | respuesta rápida                    |
| PERF-004 | Filtro por status         | usa índice                          |

Valores concretos se definirán cuando exista infraestructura real.

---

## 30. Organización de archivos de prueba

Estructura sugerida:

```text id="2vprl1"
apps/api/src/modules/tenants/tests/
├── unit/
│   ├── tenant-slug.vo.spec.ts
│   ├── tenant-status.vo.spec.ts
│   ├── tenant-currency.vo.spec.ts
│   ├── tenant-timezone.vo.spec.ts
│   ├── tenant-color.vo.spec.ts
│   └── tenant.entity.spec.ts
│
├── application/
│   ├── create-tenant.use-case.spec.ts
│   ├── update-tenant.use-case.spec.ts
│   ├── activate-tenant.use-case.spec.ts
│   ├── suspend-tenant.use-case.spec.ts
│   ├── reactivate-tenant.use-case.spec.ts
│   ├── archive-tenant.use-case.spec.ts
│   └── get-public-tenant-profile.use-case.spec.ts
│
├── integration/
│   ├── tenants.persistence.integration.spec.ts
│   ├── prisma-tenant.repository.integration.spec.ts
│   └── 001-create-tenants.migration.spec.ts
│
├── api/
│   ├── platform-tenants.api.spec.ts
│   ├── tenant-active.api.spec.ts
│   └── public-tenants.api.spec.ts
│
├── authorization/
│   ├── platform-tenants.authorization.spec.ts
│   └── tenant-active.authorization.spec.ts
│
├── multitenancy/
│   └── tenants.multitenancy.spec.ts
│
├── security/
│   ├── tenants-public.security.spec.ts
│   ├── tenants-payload.security.spec.ts
│   └── tenants-logging.security.spec.ts
│
└── contract/
    └── public-tenant-profile.wordpress.contract.spec.ts
```

---

## 31. Comandos esperados

Comandos sugeridos:

```bash id="dfc5vf"
npm run test:tenants
npm run test:tenants:unit
npm run test:tenants:integration
npm run test:tenants:api
npm run test:tenants:authorization
npm run test:tenants:multitenancy
npm run test:tenants:security
npm run test:tenants:contract
```

Comandos generales de CI:

```bash id="yen7ww"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run openapi:validate
npm run build
```

---

## 32. Requisitos para CI

En pull request, deben correr como mínimo:

```text id="d3q399"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests
authorization tests
multitenancy tests
OpenAPI validation
```

Antes de producción:

```text id="l8tb0d"
full test suite
migration tests
contract tests
smoke tests staging
```

---

## 33. Gates de calidad

No se permite merge si falla:

* validación de slug;
* transición de estado;
* creación de tenant;
* slug unique;
* endpoint público;
* autorización platform;
* autorización tenant-scoped;
* pruebas multitenant;
* contrato WordPress;
* migración;
* OpenAPI.

---

## 34. Matriz de trazabilidad

| Requisito                                | Pruebas asociadas                     |
| ---------------------------------------- | ------------------------------------- |
| FR-001 Crear tenant                      | APP-CREATE, API-CREATE, INT-TX        |
| FR-002 Generar slug                      | UT-SLUG, APP-CREATE                   |
| FR-003 Validar slug único                | INT-DB, API-CREATE                    |
| FR-004 Consultar tenants                 | API-LIST                              |
| FR-005 Consultar tenant por ID           | API-GET                               |
| FR-006 Consultar tenant por slug público | API-PUBLIC, CONTRACT-WP               |
| FR-007 Actualizar tenant                 | APP-UPDATE, API-UPD                   |
| FR-008 Actualizar branding               | API-BRAND, AUD                        |
| FR-009 Actualizar configuración          | API-CONF, AUD                         |
| FR-010 Suspender tenant                  | APP-SUSP, API-SUSP                    |
| FR-011 Reactivar tenant                  | APP-REACT, API-REACT                  |
| FR-012 Archivar tenant                   | APP-ARCH, API-ARCH                    |
| FR-013 Crear roles base                  | APP-CREATE, EVT, AUD                  |
| FR-014 Asignar administrador inicial     | APP-CREATE, INT-TX, AUTH, AUD         |
| FR-015 Registrar auditoría               | AUD                                   |
| FR-016 Emitir eventos                    | EVT                                   |
| FR-017 Exponer perfil público            | APP-PUBLIC, API-PUBLIC, CONTRACT-WP   |
| FR-018 Bloquear tenant suspendido        | APP-PUBLIC, API-PUBLIC, futuras specs |

---

## 35. Riesgos cubiertos por pruebas

| Riesgo                                 | Prueba                     |
| -------------------------------------- | -------------------------- |
| Slug duplicado                         | INT-DB-006, API-CREATE-003 |
| TenantAdmin modifica tenant ajeno      | MT-002, AUTH-TEN-004       |
| Endpoint público expone datos internos | API-PUBLIC-010 a 016       |
| Suspensión sin motivo                  | APP-SUSP-002, API-SUSP-002 |
| Tenant suspendido visible públicamente | API-PUBLIC-005             |
| Eliminación física accidental          | INT-DB-011, APP-ARCH-005   |
| Status cambiado por PATCH genérico     | API-UPD-003                |
| Falta de auditoría                     | AUD-*                      |
| Falta de eventos                       | EVT-*                      |
| URL insegura                           | SEC-URL-*                  |
| Logs con tokens                        | SEC-LOG-*                  |

---

## 36. Criterios de salida

El módulo `001-tenants` puede considerarse probado si:

* la suite completa pasa localmente;
* la suite completa pasa en CI;
* el contrato público para WordPress está validado;
* la migración está validada;
* los endpoints privados están protegidos;
* las pruebas multitenant pasan;
* las pruebas de autorización pasan;
* las operaciones críticas tienen auditoría;
* los eventos esperados se emiten;
* OpenAPI está sincronizado;
* no existen campos prohibidos en respuestas públicas;
* se documentaron limitaciones y diferidos.

---

## 37. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="n4yahq"
- Pruebas reales de Keycloak se difieren hasta integración de identidad.
- Invitaciones ordinarias posteriores pertenecen a 002-users-roles.
- Identidad, roles, membership y TenantAdmin inicial se prueban conjuntamente
  con 002-users-roles; no existe placeholder aceptable.
- Pruebas de frontend se difieren hasta existir frontend Core.
- Pruebas de sincronización WordPress avanzada se difieren a spec de integración.
```

Estos pendientes no deben bloquear `001-tenants`, pero deben quedar visibles.

---

## 38. Decisión final del test plan

El módulo `001-tenants` deberá probarse mediante unit tests, application tests, integration tests, API tests, authorization tests, multitenancy tests, security tests, contract tests, migration tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="r2w6qy"
- slug único;
- estado del tenant;
- creación transaccional;
- resolución server-side de la identidad inicial;
- rollback total de tenant, identidad, roles y membership ante cada fallo;
- rechazo de activación sin TenantAdmin activo o con mera invitación pendiente;
- endpoint público seguro;
- autorización global;
- autorización tenant-scoped;
- aislamiento entre tenants;
- auditoría;
- eventos;
- contrato WordPress;
- migración segura.
```

Ninguna implementación de este módulo deberá ser aceptada si permite acceso cross-tenant, expone datos internos por endpoint público, omite auditoría en operaciones críticas o rompe el contrato público con WordPress.

Los gates `GAP-S2-003` deben cubrir además concurrencia, conflicto
email/subject, Keycloak indisponible y protección del último `TenantAdmin`, según
`docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md`.
