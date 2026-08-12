# Sprint 1 — Backend Platform Base

## 1. Información del documento

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Fase | FASE 2 — Implementación técnica |
| Sprint | Sprint 1 |
| Documento | Backend Platform Base Implementation Runbook |
| Ruta | `docs/implementation/sprint-1-backend-platform-base.md` |
| Estado | `completed` — cierre formal sustentado por `SPRINT-1-CLOSURE-2026-08-11` |
| Fecha | 2026-08-11 |
| Commit base evaluado | `09310d5` |
| Naturaleza | Plataforma backend runtime, sin lógica de negocio |

---

## 2. Propósito

Implementar sobre la fundación de Sprint 0 la base runtime mínima de la API NestJS:
configuración validada, validación HTTP, manejo seguro de errores, logging sanitizado,
salud de la aplicación, conexión técnica con PostgreSQL, contrato OpenAPI y esqueletos
fail-closed de seguridad y auditoría.

Regla central:

```text id="sprint1-rule"
Sprint 1 implementa capacidades transversales de plataforma. No implementa tenants,
usuarios, roles, membresías, residentes, propiedades, finanzas, documentos, reservas ni
ningún otro flujo de negocio. Tampoco integra todavía Keycloak ni crea persistencia de
auditoría.
```

## 2.1. Autorización y fuentes

Este runbook queda autorizado únicamente por la decisión:

```text id="sprint1-readiness-source"
docs/changes/READINESS-SPRINT-1-2026-08-11.md
Decision: GO
Authorized scope: Sprint 1 — Backend Platform Base
```

Fuentes aplicables:

- `docs/sdd/constitution.md`;
- ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-009, ADR-010,
  ADR-011 y ADR-012;
- `docs/sdd/architecture.md`, `security.md`, `api-guidelines.md` y
  `data-governance.md`;
- Spec 031, en particular su secuencia de Fase 1;
- el cierre formal de Sprint 0.

Las specs 001–030 permanecen en `needs-review` y no autorizan implementación funcional.

---

## 3. Alcance autorizado

```text id="sprint1-scope"
- ConfigModule global y validación centralizada de variables de entorno;
- prefijo global /api/v1;
- ValidationPipe global estricto;
- traceId por request;
- ExceptionFilter global con error envelope seguro;
- logger de aplicación con sanitización y redacción;
- CORS por allowlist, headers de seguridad y rate limiting base;
- HealthModule conforme a ADR-010 §10;
- PrismaService y conexión técnica de la aplicación con PostgreSQL;
- Swagger/OpenAPI runtime y contrato canónico generado;
- validación determinista de drift del contrato OpenAPI;
- esqueletos técnicos fail-closed de autenticación, tenant y permisos;
- puerto/interceptor técnico de auditoría, sin persistencia;
- pruebas unitarias, de integración y de contrato/API del alcance;
- activación de los gates de CI exigibles al existir API runtime;
- ajustes mínimos de Docker Compose y del Dockerfile para ejecutar esta base.
```

## 3.1. Fuera de alcance

```text id="sprint1-out-of-scope"
- modelos Prisma de dominio, incluidos Tenant, UserProfile, roles y memberships;
- migraciones o seeds;
- repositorios de dominio;
- realm import, login, validación JWT o integración runtime con Keycloak;
- resolución funcional de tenant;
- evaluación funcional de permisos o roles;
- tabla, modelo o repositorio audit_logs;
- API o persistencia runtime de Implementation Readiness;
- endpoints funcionales distintos de health y documentación técnica;
- lógica de residentes, propiedades, cuotas, pagos, documentos o reservas;
- frontends funcionales;
- despliegue no local o infraestructura productiva.
```

Los elementos anteriores requieren el sprint y las specs correspondientes. En particular,
Tenants, identidad, autorización funcional, Keycloak y auditoría persistente comienzan en
Sprint 2 después de aprobar 001, 002, 007 y 025 según corresponda.

---

## 4. Contratos técnicos cerrados por este runbook

### 4.1. Entornos y puerto

Se separan dos ejes que no deben mezclarse:

| Variable | Valores | Autoridad |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test`, `production` | comportamiento del runtime Node.js |
| `APP_ENV` | `local`, `development`, `staging`, `production` | entorno de despliegue y políticas de exposición |

`API_PORT` es el nombre canónico del puerto de la aplicación y su valor por defecto local
es `3000`. Sprint 1 debe retirar el uso interno de `PORT` y alinear `main.ts`,
`.env.example`, Docker Compose, pruebas y CI con `API_PORT`.

La validación de configuración será código TypeScript puro reutilizable en
`packages/config`; no se incorpora Joi. Las variables requeridas se validan al arranque y
los errores nunca imprimen valores secretos.

### 4.2. Versiones de dependencias

Las adiciones previstas se fijan con versión exacta, sin rangos:

| Dependencia | Versión | Uso |
| --- | --- | --- |
| `@nestjs/config` | `4.0.4` | configuración runtime |
| `@nestjs/swagger` | `11.4.6` | OpenAPI runtime |
| `@nestjs/testing` | `11.1.29` | pruebas NestJS alineadas con core |
| `@nestjs/throttler` | `6.5.0` | rate limiting base |
| `class-transformer` | `0.5.1` | transformación de DTOs |
| `class-validator` | `0.15.1` | validación de DTOs |
| `helmet` | `8.3.0` | headers de seguridad |

Las versiones fueron verificadas en el registro npm el 2026-08-11 y son compatibles con
NestJS 11. No se autoriza introducir otro framework de configuración, logging, seguridad
u OpenAPI sin justificarlo y revisar el impacto documental.

### 4.3. Bootstrap HTTP

La API debe:

- usar el prefijo global `/api/v1`;
- aplicar `ValidationPipe` con `transform: true`, `whitelist: true` y
  `forbidNonWhitelisted: true`;
- generar un `traceId` no controlado por el cliente y compartirlo entre respuesta y log;
- devolver errores con `{ error: { code, message, details, traceId } }`;
- ocultar stack traces, SQL, hosts, puertos internos, rutas y mensajes crudos de proveedores;
- aplicar CORS con allowlist explícita, nunca `*` con credenciales;
- aplicar headers seguros y rate limiting configurado por entorno;
- usar el logger de NestJS mediante una abstracción pequeña con redacción, sin introducir
  otro framework de logging en este sprint.

Claves, tokens, cookies, contraseñas, cadenas de conexión y PII no deben quedar en logs.

### 4.4. Health

El contrato autoritativo es ADR-010 §10:

| Endpoint | Acceso | Semántica |
| --- | --- | --- |
| `GET /api/v1/health` | público | liveness mínima, sin consultar dependencias |
| `GET /api/v1/health/details` | protegido | readiness detallada; `200 ok` o `503 degraded` |

Ambos usan payload plano y son la única excepción al response envelope de éxito. El
documento OpenAPI debe incluir `x-response-envelope: false` y
`x-health-endpoint: true`.

En `APP_ENV=local`, el endpoint detallado puede operar sin Bearer porque Compose publica
la API exclusivamente en `127.0.0.1`. En cualquier otro entorno debe fallar cerrado con
`403` mientras no exista el adaptador de identidad capaz de comprobar
`platform.health.read`. Sprint 1 no implementará un token temporal ni adelantará
Keycloak. No se autoriza un despliegue no local con esta limitación pendiente.

PostgreSQL es la única dependencia requerida que la aplicación activa en Sprint 1.
Redis, object storage e IdP deben reportarse como `notConfigured` y no degradar readiness
hasta que sus adaptadores runtime sean autorizados. Ningún detalle debe revelar topología,
credenciales o mensajes crudos.

### 4.5. Prisma

Sprint 1 debe:

- mover `@prisma/client` a dependencias runtime de la API;
- mantener `prisma` como dependencia de desarrollo;
- incorporar `prisma:generate` real al flujo de build;
- implementar `PrismaService` con conexión y cierre del ciclo de vida;
- validar conectividad mediante una operación técnica equivalente a `SELECT 1`;
- incluir `prisma/schema.prisma` y el cliente generado en el build Docker;
- resolver la dependencia OpenSSL de Prisma en la imagen Debian slim.

El schema seguirá conteniendo solo `generator` y `datasource`. No habrá modelos,
migraciones ni seeds.

### 4.6. OpenAPI

La API expondrá documentación técnica en:

```text
GET /api/v1/docs
GET /api/v1/docs-json
```

Solo se habilitan en `APP_ENV=local` o `development`; quedan deshabilitadas en `staging`
y `production` hasta definir su exposición segura.

El contrato canónico generado se versionará en:

```text
packages/openapi-client/openapi/resident-core.v1.json
```

La generación debe ser determinista. `openapi:generate` actualiza el artefacto;
`openapi:check` lo regenera temporalmente y falla si existe drift. Redocly valida el
contrato generado. El placeholder `tooling.yaml` deja de ser el contrato validado cuando
el contrato runtime entra en vigor.

### 4.7. Esqueletos de seguridad y auditoría

Los esqueletos respetarán los límites modulares `identity-integration`, `access-control`
y `audit` de la arquitectura:

- `AuthGuard`, `TenantGuard` y `PermissionGuard` pueden existir como contratos técnicos,
  pero deben negar acceso si se aplican sin un adaptador autorizado;
- no se registran globalmente como si la autenticación ya fuera funcional;
- no se codifican roles, permisos o tenants provisionales;
- el puerto de auditoría y su interceptor no escriben en base de datos ni prometen
  durabilidad;
- no se crea un módulo de dominio `tenants` en Sprint 1.

---

## 5. Backlog y orden de implementación

### 5.1. PR 1 — Configuración y bootstrap seguro

```text id="sprint1-pr1"
[x] Añadir las dependencias exactas de configuración, validación y seguridad.
[x] Ampliar packages/config con schema y parser puro de entorno.
[x] Unificar API_PORT y los valores de NODE_ENV/APP_ENV.
[x] Crear ConfigModule global.
[x] Configurar prefijo /api/v1 y ValidationPipe global.
[x] Implementar traceId y ExceptionFilter seguro.
[x] Implementar logger sanitizado y pruebas de redacción.
[x] Configurar CORS, Helmet y rate limiting base.
[x] Añadir pruebas unitarias y API negativas correspondientes.
[x] Activar en CI los gates que estos artefactos requieran.
```

### 5.2. PR 2 — Prisma y Health

```text id="sprint1-pr2"
[x] Corregir dependencias y scripts de Prisma.
[x] Implementar PrismaService sin modelos de dominio.
[x] Implementar liveness pública sin dependencias.
[x] Implementar readiness detallada con PostgreSQL como dependencia requerida.
[x] Implementar protección local/no local fail-closed.
[x] Alinear Compose con API_PORT, APP_ENV y DATABASE_URL.
[x] Hacer que resident-api dependa del health de PostgreSQL.
[x] Cambiar el healthcheck del contenedor a /api/v1/health.
[x] Incluir Prisma y OpenSSL en el build de la imagen.
[x] Añadir pruebas unitarias, de integración y de contrato health.
```

### 5.3. PR 3 — OpenAPI runtime y contrato

```text id="sprint1-pr3"
[x] Configurar Swagger/OpenAPI runtime.
[x] Documentar health y sus extensiones de excepción al envelope.
[x] Restringir docs y docs-json por APP_ENV.
[x] Generar resident-core.v1.json de forma determinista.
[x] Implementar openapi:generate, openapi:validate y openapi:check.
[x] Sustituir el placeholder como objetivo del lint de Redocly.
[x] Añadir pruebas de contrato y drift.
[x] Activar el gate OpenAPI runtime en CI.
```

### 5.4. PR 4 — Esqueletos y consolidación

```text id="sprint1-pr4"
[x] Crear puertos y guards técnicos fail-closed.
[x] Crear puerto/interceptor técnico de auditoría sin persistencia.
[x] Probar que ningún esqueleto concede acceso por defecto.
[x] Confirmar ausencia de modelos, migraciones, seeds y endpoints de dominio.
[x] Ejecutar todos los gates de Sprint 1 localmente.
[x] Revisar Docker Compose completo y la imagen resident-api.
[x] Registrar el cierre formal y actualizar el estado documental.
```

Cada PR debe incluir las pruebas y gates de su propio cambio. No se pospone la cobertura
de seguridad o contrato al último PR.

---

## 6. Gates obligatorios de CI

Se mantienen todos los gates de Sprint 0 y se activan los exigidos por ADR-012 §10.2 al
existir API runtime:

```text id="sprint1-ci-gates"
- format:check;
- lint;
- typecheck;
- unit tests;
- integration tests con PostgreSQL efímero;
- API/contract tests;
- openapi:generate y openapi:check sin drift;
- Redocly lint del contrato runtime;
- prisma:generate y prisma:validate;
- docker compose config;
- dependency audit high;
- secret scan;
- workspace build;
- resident-api image build.
```

El gate de migraciones sigue inactivo porque Sprint 1 no crea migraciones. Los gates
funcionales de multitenancy y autorización se activan en Sprint 2; en Sprint 1 solo son
obligatorias las pruebas negativas fail-closed de los esqueletos.

---

## 7. Validación local mínima

Los nombres definitivos de scripts se incorporan junto con cada capacidad. Al cierre
deben poder ejecutarse, como mínimo:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:api
pnpm openapi:check
pnpm openapi:validate
pnpm prisma:generate
pnpm prisma:validate
pnpm docker:config
pnpm build
pnpm docker:build:api
```

Además, con Docker Desktop operativo:

```powershell
docker compose up -d --build
docker compose ps
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health/details
```

La ejecución no debe usar datos reales ni secretos reales.

---

## 8. Definition of Done

```text id="sprint1-dod"
[x] Todos los elementos del alcance autorizado están implementados.
[x] La configuración falla temprano y sin filtrar valores sensibles.
[x] /api/v1/health cumple exactamente ADR-010 y no consulta dependencias.
[x] /api/v1/health/details cumple acceso y semántica 200/503.
[x] El error envelope y traceId cumplen api-guidelines.
[x] Los logs superan las pruebas de redacción.
[x] Prisma conecta con PostgreSQL sin modelos, migraciones ni seeds.
[x] El contrato OpenAPI runtime es determinista, válido y sin drift.
[x] Los esqueletos de auth, tenant y permisos fallan cerrados.
[x] Auditoría no afirma persistencia inexistente.
[x] Compose e imagen resident-api funcionan con la base runtime.
[x] Todos los gates obligatorios pasan en CI.
[x] No existe lógica de negocio ni implementación adelantada de Sprint 2.
[x] El diff fue revisado y el cierre documental fue registrado.
```

---

## 9. No aceptación

Sprint 1 no se acepta si:

- aparece un modelo, migración, seed o endpoint de dominio;
- liveness consulta PostgreSQL u otra dependencia;
- readiness detallada queda pública fuera de local;
- se inventa autenticación temporal o se confía en datos del cliente;
- un guard concede acceso por ausencia de configuración;
- se exponen secretos, PII, `storageKey`, SQL o topología interna;
- OpenAPI diverge del runtime;
- el Dockerfile no puede generar o ejecutar Prisma Client;
- CI omite integración, API/contrato u OpenAPI drift;
- se afirma integración Keycloak o auditoría persistente sin implementarlas.

---

## 10. Siguiente paso

Crear una rama corta desde `main` para el PR 1, implementar únicamente configuración y
bootstrap seguro, ejecutar sus gates y abrir un PR sujeto a la protección vigente de
`main`. La autorización de este runbook no habilita Sprint 2.
