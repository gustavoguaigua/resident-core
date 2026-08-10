# Sprint 0 — Fundación técnica del repositorio RESIDENT Core

## 1. Información del documento

| Campo         | Valor                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Proyecto      | RESIDENT Core                                                         |
| Fase          | FASE 2 — Inicio de implementación técnica                             |
| Sprint        | Sprint 0                                                              |
| Documento     | Foundation Implementation Runbook                                     |
| Ruta sugerida | `docs/implementation/sprint-0-foundation.md`                          |
| Estado        | Borrador operativo inicial                                            |
| Fecha         | 2026-08-06                                                            |
| Naturaleza    | Implementación base / Monorepo / Entorno local / Tooling / CI inicial |

---

## 2. Propósito

Este documento define el primer paso práctico para iniciar la implementación técnica de RESIDENT Core después del cierre de la fase SDD inicial.

El objetivo de Sprint 0 es crear una base técnica mínima, reproducible y segura para comenzar el desarrollo de los módulos funcionales definidos en los paquetes `001` a `031`.

Regla central:

```text id="sprint0-rule"
Sprint 0 debe crear únicamente la fundación técnica del repositorio, tooling, estructura de carpetas, configuración local, Docker Compose, servicios base, CI inicial y convenciones de desarrollo; no debe implementar todavía lógica de negocio productiva, pagos, residentes, alícuotas, estados de cuenta, documentos, reservas, visitantes, WordPress transaccional ni frontends funcionales completos.
```

### 2.1. Frontera normativa entre Sprint 0 y Sprint 1

Esta es la definición única de la frontera. En este documento y en los resúmenes que lo
referencian, los términos `base`, `inicial` y `preparado` para Sprint 0 significan
**scaffold y tooling**, no comportamiento de plataforma en runtime.

```text id="sprint0-sprint1-boundary"
Sprint 0 — Fundación técnica:
- crea el workspace, la estructura de apps y packages y los scaffolds compilables;
- configura TypeScript strict, lint, formato, pruebas smoke y CI inicial;
- define la infraestructura local y sus health checks de contenedor;
- instala y configura el tooling de Prisma, sin PrismaService ni integración de la
  aplicación con PostgreSQL;
- prepara dependencias, packages y scripts de OpenAPI, sin Swagger/OpenAPI runtime,
  endpoints de documentación ni generación de contratos desde la API;
- no crea módulos, guards, interceptors ni contratos HTTP de plataforma o negocio.

Sprint 1 — Backend Platform Base:
- implementa ConfigModule y validación de entorno;
- activa ValidationPipe global, ExceptionFilter y logger sanitizado;
- implementa HealthModule y su contrato HTTP;
- implementa PrismaService y la conexión de la aplicación con PostgreSQL;
- habilita Swagger/OpenAPI en runtime, sus endpoints y la generación del contrato;
- crea los esqueletos técnicos de autenticación, tenant, permisos y auditoría;
- sigue excluyendo lógica de negocio, que requiere el sprint y la spec correspondientes.
```

Los health checks de Docker Compose pertenecen a Sprint 0; los endpoints HTTP de salud
de la API pertenecen a Sprint 1 y usan el contrato de ADR-010 §10. El schema Prisma de Sprint 0 es exclusivamente de
configuración, sin modelos de dominio. El contrato HTTP de health permanece sujeto a
GAP-031-006.

La compuerta 031 se ejecuta y conserva como Markdown/Git. Sprint 0 no implementa la API
`/api/v1/platform/readiness` ni modelos, tablas, migraciones, seeds o repositorios de
readiness. Los diseños API y de datos de spec 031 permanecen diferidos y requieren un
sprint posterior explícitamente aprobado; no pasan automáticamente a Sprint 1.

---

## 3. Resultado esperado

Al finalizar Sprint 0 debe existir:

```text id="sprint0-expected-result"
- monorepo creado;
- estructura apps/api, apps/admin-web y apps/resident-web creada;
- packages/shared, packages/config, packages/auth, packages/openapi-client y
  packages/testing creados;
- docs preservado como fuente SDD;
- Docker Compose local creado;
- PostgreSQL local configurado;
- Redis local configurado;
- Keycloak local configurado;
- PostgreSQL dedicado de Keycloak configurado;
- MinIO local configurado;
- MailHog local configurado;
- NestJS API scaffold compilable creado;
- Next.js admin-web base creada;
- Next.js resident-web base creada;
- tooling de Prisma instalado y configurado, sin PrismaService;
- tooling de OpenAPI preparado, sin runtime ni endpoints de documentación;
- TypeScript strict activo;
- ESLint/Prettier configurados;
- GitHub Actions inicial configurado;
- .env.example creado sin secretos reales;
- README inicial creado;
- ningún dato real usado;
- ningún secreto versionado.
```

---

## 4. Estructura objetivo del repositorio

```text id="sprint0-repository-structure"
resident-core/
├── apps/
│   ├── api/
│   ├── admin-web/
│   └── resident-web/
├── packages/
│   ├── shared/
│   ├── config/
│   ├── auth/
│   ├── openapi-client/
│   └── testing/
├── docs/
│   ├── sdd/
│   ├── decisions/
│   ├── specs/
│   ├── changes/
│   ├── implementation/
│   └── consolidated/
├── infra/
│   ├── docker/
│   ├── keycloak/
│   ├── postgres/
│   └── local/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
├── tools/
│   ├── openapi/
│   ├── scripts/
│   └── ci/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── .node-version
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── AGENTS.md
└── README.md
```

---

## 5. Stack base de Sprint 0

```text id="sprint0-stack"
Runtime: Node.js 24.18.0 LTS
Package manager: pnpm 11.21.0
Backend: NestJS + TypeScript
Frontend Admin: Next.js + React + TypeScript
Frontend Resident: Next.js + React + TypeScript
Database: PostgreSQL
ORM: Prisma
Cache/Queues: Redis
Identity Provider: Keycloak
API Contract: OpenAPI
Containerization: Docker + Docker Compose
CI/CD inicial: GitHub Actions
Testing base: Jest / Vitest
Formatting: Prettier
Linting: ESLint
```

---

## 6. Reglas de seguridad de Sprint 0

```text id="sprint0-security-rules"
- No usar datos reales.
- No subir .env reales.
- No subir secretos.
- No subir tokens.
- No subir dumps de base de datos.
- No subir comprobantes reales.
- No subir documentos privados.
- No configurar WordPress como backend transaccional.
- No crear rutas públicas privadas.
- No exponer storageKey.
- No implementar pagos reales.
- No conectar pasarelas reales.
- No conectar open banking real.
- No conectar hardware.
- No usar biometría.
- No enviar datos reales a IA externa.
```

---

## 7. Checklist Sprint 0

### 7.1. Inicialización del repositorio

```text id="sprint0-repo-checklist"
[ ] Crear carpeta resident-core.
[ ] Inicializar Git.
[ ] Usar main como única rama permanente.
[ ] Renombrar la rama local legacy master a main después de aprobar el baseline documental.
[ ] No crear develop.
[ ] Crear .gitignore.
[ ] Crear README.md.
[x] Incorporar el AGENTS.md raíz al control de versiones.
[ ] Crear pnpm-workspace.yaml.
[ ] Crear package.json raíz.
[ ] Crear .node-version con 24.18.0.
[ ] Crear tsconfig.base.json.
[ ] Crear .env.example.
[ ] Crear estructura docs/.
[ ] Copiar documentación SDD existente.
```

---

### 7.2. Apps base

```text id="sprint0-apps-checklist"
[ ] Crear apps/api.
[ ] Crear apps/admin-web.
[ ] Crear apps/resident-web.
[ ] Confirmar que apps/api compila.
[ ] Confirmar que apps/admin-web compila.
[ ] Confirmar que apps/resident-web compila.
```

---

### 7.3. Packages base

```text id="sprint0-packages-checklist"
[ ] Crear packages/shared.
[ ] Crear packages/config.
[ ] Crear packages/auth.
[ ] Crear packages/openapi-client.
[ ] Crear packages/testing.
[ ] Configurar exports básicos.
[ ] Configurar TypeScript references si aplica.
```

Alcance obligatorio de los scaffolds:

| Package | Entregable de Sprint 0 | Fuera de Sprint 0 |
| --- | --- | --- |
| `packages/auth` | Manifest, TypeScript strict, `src/index.ts`, exports vacíos o tipos técnicos mínimos y build/smoke test | Login, guards, validación de tokens, sesiones, integración Keycloak, autorización o contexto tenant |
| `packages/openapi-client` | Manifest, TypeScript strict, comando real `validate` para el tooling y estructura preparada para generación | Cliente de dominio generado, consumo de endpoints o contrato OpenAPI runtime |
| `packages/testing` | Manifest, TypeScript strict, utilidades base, smoke test y comando real `security:secrets` con scanner aprobado/versionado | Fixtures de dominio, datos reales y suites de autorización, multitenancy o finanzas aún no activadas |

Los tres paquetes deben compilar y participar en los scripts raíz aplicables. No se
consideran satisfechos mediante directorios vacíos, scripts placeholder o comandos que
ignoren la ausencia de implementación.

---

### 7.4. Infraestructura local

```text id="sprint0-infra-checklist"
[ ] Crear docker-compose.yml.
[ ] Agregar PostgreSQL.
[ ] Agregar Redis.
[ ] Agregar Keycloak.
[ ] Agregar PostgreSQL dedicado para Keycloak como keycloak-postgres.
[ ] Agregar MinIO.
[ ] Agregar MailHog.
[ ] Agregar resident-api como scaffold contenerizado.
[ ] Usar exactamente las imágenes y tags canónicos de ADR-009 §7.1.
[ ] Verificar que no existan `latest`, aliases LTS ni versiones flotantes.
[ ] Agregar red Docker local.
[ ] Agregar volúmenes locales.
[ ] Agregar health checks de infraestructura.
[ ] Crear infra/keycloak/.
[ ] Crear infra/postgres/.
[ ] Crear infra/local/.
```

---

### 7.5. Backend base

```text id="sprint0-backend-checklist"
[ ] Crear scaffold compilable de NestJS API.
[ ] Activar TypeScript strict.
[ ] Configurar lint, typecheck, build y prueba smoke del scaffold.
[ ] Preparar dependencias y scripts de Swagger/OpenAPI sin habilitarlos en runtime.
[ ] Instalar y configurar el tooling de Prisma sin crear PrismaService.
[ ] Crear schema.prisma solo con generator y datasource, sin modelos ni enums.
[ ] Verificar PostgreSQL como servicio local, sin conectar todavía la aplicación.
```

`ConfigModule`, `ValidationPipe`, `ExceptionFilter`, logger de aplicación,
`HealthModule`, `PrismaService` y `OpenAPIModule` son entregables de Sprint 1.

---

### 7.6. Frontends base

```text id="sprint0-frontend-checklist"
[ ] Crear admin-web con Next.js.
[ ] Crear resident-web con Next.js.
[ ] Activar TypeScript strict.
[ ] Configurar ESLint.
[ ] Configurar Prettier.
[ ] Preparar estructura app/.
[ ] Preparar estructura components/.
[ ] Preparar estructura lib/.
[ ] Preparar variables de entorno públicas mínimas.
[ ] No integrar aún lógica de negocio.
```

---

### 7.7. CI inicial

```text id="sprint0-ci-checklist"
[ ] Crear .github/workflows/ci.yml.
[ ] Ejecutar install.
[ ] Ejecutar lint.
[ ] Ejecutar format check.
[ ] Ejecutar TypeScript check.
[ ] Ejecutar tests base.
[ ] Validar tooling OpenAPI.
[ ] Validar schema Prisma.
[ ] Validar docker compose config.
[ ] Ejecutar dependency audit.
[ ] Ejecutar secret scan.
[ ] Ejecutar build api.
[ ] Ejecutar build admin-web.
[ ] Ejecutar build resident-web.
[ ] Construir la imagen resident-api mediante Docker Compose.
[ ] Configurar Required CI gates como status check obligatorio.
```

---

## 8. Comandos sugeridos de arranque

### 8.1. Crear carpeta base

```bash id="sprint0-cmd-create-root"
mkdir resident-core
cd resident-core
git init -b main
pnpm init
```

El repositorio existente ya está inicializado sobre `master`. No debe reinicializarse.
Tras aprobar el baseline documental y antes de crear CI o remoto, normalizarlo con:

```bash id="sprint0-cmd-normalize-branch"
git branch -m master main
```

No se elimina ninguna rama remota en este paso. Si se crea un remoto posteriormente,
`main` debe configurarse como rama por defecto y protegerse antes de retirar referencias
legacy.

---

### 8.2. Crear estructura principal

```bash id="sprint0-cmd-create-folders"
mkdir -p apps/api
mkdir -p apps/admin-web
mkdir -p apps/resident-web

mkdir -p packages/shared
mkdir -p packages/config
mkdir -p packages/auth
mkdir -p packages/openapi-client
mkdir -p packages/testing

mkdir -p docs/sdd
mkdir -p docs/decisions
mkdir -p docs/specs
mkdir -p docs/changes
mkdir -p docs/implementation
mkdir -p docs/consolidated

mkdir -p infra/docker
mkdir -p infra/keycloak
mkdir -p infra/postgres
mkdir -p infra/local

mkdir -p prisma/migrations
mkdir -p prisma/seed

mkdir -p tools/openapi
mkdir -p tools/scripts
mkdir -p tools/ci

mkdir -p .github/workflows
```

---

### 8.3. Crear workspace pnpm

```yaml id="sprint0-pnpm-workspace"
packages:
  - "apps/*"
  - "packages/*"
```

Guardar como:

```text id="sprint0-pnpm-path"
pnpm-workspace.yaml
```

---

### 8.4. Fijar runtime local

Crear `.node-version` con contenido exacto:

```text id="sprint0-node-version"
24.18.0
```

El gestor de versiones local debe seleccionar esa versión. Después de habilitar pnpm a
partir del campo `packageManager` del manifest raíz, la comprobación esperada es:

```text id="sprint0-runtime-check"
node --version  -> v24.18.0
pnpm --version  -> 11.21.0
```

---

## 9. package.json raíz sugerido

```json id="sprint0-root-package-json"
{
  "name": "resident-core",
  "version": "0.1.0",
  "private": true,
  "description": "RESIDENT Core - multitenant residential administration platform",
  "packageManager": "pnpm@11.21.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f",
    "prisma:generate": "pnpm --filter @resident/api prisma:generate",
    "prisma:validate": "pnpm --filter @resident/api prisma:validate",
    "prisma:migrate": "pnpm --filter @resident/api prisma:migrate",
    "openapi:generate": "pnpm --filter @resident/api openapi:generate",
    "openapi:validate": "pnpm --filter @resident/openapi-client validate",
    "security:dependencies": "pnpm audit --audit-level high",
    "security:secrets": "pnpm --filter @resident/testing security:secrets"
  },
  "devDependencies": {
    "prettier": "latest"
  },
  "engines": {
    "node": "24.18.0",
    "pnpm": "11.21.0"
  }
}
```

Nota:

```text id="sprint0-package-note"
La versión canónica es Node.js 24.18.0 con pnpm 11.21.0. `.node-version`,
`packageManager`, `engines`, CI y futuras imágenes Node deben usar exactamente esas
versiones. Corepack o cualquier gestor compatible debe respetar el campo
`packageManager`; no se permite resolver pnpm mediante `latest` o un major flotante.
```

---

## 10. tsconfig.base.json sugerido

```json id="sprint0-tsconfig"
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@resident/shared": ["packages/shared/src"],
      "@resident/config": ["packages/config/src"],
      "@resident/auth": ["packages/auth/src"],
      "@resident/openapi-client": ["packages/openapi-client/src"],
      "@resident/testing": ["packages/testing/src"]
    }
  }
}
```

---

## 11. .gitignore sugerido

```gitignore id="sprint0-gitignore"
node_modules/
.next/
dist/
build/
coverage/

.env
.env.*
!.env.example

.DS_Store
Thumbs.db

*.log
npm-debug.log*
pnpm-debug.log*

prisma/dev.db
*.sqlite
*.sqlite3

docker-data/
tmp/
.cache/

keycloak-data/
postgres-data/
redis-data/

*.pem
*.key
*.crt
*.p12
*.pfx

*.dump
*.backup
*.bak

uploads/
private-files/
```

---

## 12. .env.example sugerido

```env id="sprint0-env-example"
# General
NODE_ENV=development
APP_ENV=local

# API
API_PORT=3000
API_BASE_URL=http://localhost:3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=resident_core
POSTGRES_USER=resident
POSTGRES_PASSWORD=resident_dev_password
DATABASE_URL=postgresql://resident:resident_dev_password@localhost:5432/resident_core?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=resident
KEYCLOAK_API_CLIENT_ID=resident-api
KEYCLOAK_ADMIN_WEB_CLIENT_ID=resident-admin-web
KEYCLOAK_RESIDENT_WEB_CLIENT_ID=resident-resident-web
KEYCLOAK_DB_HOST=localhost
KEYCLOAK_DB_PORT=5433
KEYCLOAK_DB_NAME=keycloak
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=keycloak_dev_password

# S3-compatible local storage / MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=local
S3_BUCKET=resident-local
S3_ACCESS_KEY=minio_dev_access
S3_SECRET_KEY=minio_dev_secret

# Local email / MailHog
SMTP_HOST=localhost
SMTP_PORT=1025

# Frontend
NEXT_PUBLIC_RESIDENT_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=resident
NEXT_PUBLIC_KEYCLOAK_ADMIN_WEB_CLIENT_ID=resident-admin-web
NEXT_PUBLIC_KEYCLOAK_RESIDENT_WEB_CLIENT_ID=resident-resident-web

# Security flags
WORDPRESS_TRANSACTIONAL_BACKEND_ENABLED=false
PUBLIC_ADMIN_ROUTES_ENABLED=false
PUBLIC_RESIDENT_TRANSACTIONAL_ROUTES_ENABLED=false
STORAGE_KEY_EXPOSURE_ENABLED=false
EXTERNAL_AI_REAL_DATA_ENABLED=false
HARDWARE_CONTROL_ENABLED=false
BIOMETRICS_ENABLED=false
```

`resident-web` es el nombre del workspace de la aplicación. El `client_id` OIDC
canónico de esa aplicación es `resident-resident-web`, conforme a ADR-006.

---

## 13. docker-compose.yml inicial

La lista canónica, subordinada a ADR-009 §7, es:

| Servicio Compose | Imagen o tag exacto | Rol en Sprint 0 | Obligatorio |
| --- | --- | --- | --- |
| `resident-api` | `resident-api:0.1.0-sprint0`; base `node:24.18.0-bookworm-slim` | Scaffold NestJS contenerizado; sin módulos runtime de Sprint 1 | Sí |
| `postgres` | `postgres:17.10-bookworm` | Base de datos de RESIDENT Core | Sí |
| `redis` | `redis:7.4.10-bookworm` | Infraestructura de cache/colas, sin jobs de negocio | Sí |
| `keycloak` | `quay.io/keycloak/keycloak:26.7.0` | Proveedor de identidad local | Sí |
| `keycloak-postgres` | `postgres:17.10-bookworm` | Base dedicada exclusivamente a Keycloak | Sí |
| `mailhog` | `mailhog/mailhog:v1.0.1` | Captura local de correo sintético | Sí |
| `minio` | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | Storage S3-compatible local con datos sintéticos | Sí |

No se agregarán a la topología obligatoria de Sprint 0 `resident-worker`,
`admin-web`, `resident-web`, reverse proxy, WordPress, n8n ni servicios de
observabilidad. Los scaffolds frontend se ejecutarán en el host; un perfil Compose futuro
podrá incorporarlos sin cambiar el criterio de cierre.

El YAML ejecutable deberá contener exactamente los siete servicios obligatorios y usar
los valores de la tabla sin `latest`, aliases LTS, majors o minors flotantes. Cualquier
actualización debe ser explícita y atómica con ADR-009 y las validaciones de readiness.

Notas:

```text id="sprint0-docker-notes"
- Este archivo es únicamente para desarrollo local.
- Las credenciales son ficticias.
- No usar estas credenciales en staging ni producción.
- Keycloak deberá endurecerse en ambientes no locales.
- postgres y keycloak-postgres usan bases y volúmenes separados.
- MailHog y MinIO son locales y solo contienen datos sintéticos.
- MailHog y la imagen comunitaria fijada de MinIO no están autorizados para staging o producción.
- MinIO debe reevaluarse antes de cualquier ambiente no local.
- los servicios de infraestructura deben declarar health checks donde la imagen los soporte.
- resident-api debe validar arranque del contenedor sin introducir HealthModule de Sprint 1.
```

---

## 14. README.md inicial sugerido

````markdown id="sprint0-readme"
# RESIDENT Core

RESIDENT Core es el sistema transaccional de la plataforma RESIDENT para administración de conjuntos residenciales.

## Estado

FASE 2 — Inicio de implementación técnica.

## Arquitectura inicial

- Monorepo.
- API backend con NestJS.
- Base de datos PostgreSQL.
- ORM Prisma.
- Redis para cache/colas.
- Keycloak como proveedor de identidad.
- Admin Web App con Next.js.
- Resident Web App con Next.js.
- OpenAPI como contrato entre backend y frontends.

## Reglas críticas

- WordPress no es backend transaccional.
- RESIDENT Core es la fuente de verdad.
- Keycloak autentica.
- Core autoriza.
- Todo dato tenant-scoped debe respetar tenant isolation.
- No usar datos reales en desarrollo local.
- No subir secretos al repositorio.
- No exponer storageKey.
- No enviar datos reales a IA externa.

## Arranque local

```bash
pnpm install
pnpm docker:up
pnpm build
````

## Documentación

La documentación SDD se encuentra en:

```text
docs/
├── sdd/
├── decisions/
└── specs/
```

````

---

## 15. GitHub Actions inicial

Ruta:

```text id="sprint0-ci-path"
.github/workflows/ci.yml
````

Contrato mínimo del workflow:

```yaml id="sprint0-ci-yml"
name: CI

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

jobs:
  validate:
    name: Required CI gates
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: "11.21.0"

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "24.18.0"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Validate OpenAPI tooling
        run: pnpm openapi:validate

      - name: Validate Prisma schema
        run: pnpm prisma:validate

      - name: Validate Docker Compose
        run: docker compose config --quiet

      - name: Dependency audit
        run: pnpm security:dependencies

      - name: Secret scan
        run: pnpm security:secrets

      - name: Build
        run: pnpm build

      - name: Build resident-api image
        run: docker compose build resident-api
```

Reglas:

```text id="sprint0-ci-note"
- Todos los pasos anteriores son obligatorios en pull requests y pushes a main.
- Branch protection exige el status check Required CI gates.
- El workflow no usa continue-on-error ni ignora códigos de salida.
- La ausencia de un script requerido hace fallar el gate.
- El secret scanner debe implementarse y fijarse a una versión antes de aceptar ci.yml.
- openapi:validate comprueba tooling/configuración en Sprint 0, sin contrato runtime.
- prisma:validate comprueba el schema configuration-only, sin migraciones.
- Integration/API, migration, authorization, multitenancy, financial y client-generation
  gates se activan cuando aparece la capacidad correspondiente, conforme a ADR-012 §10.2.
```

---

## 16. Schema Prisma de configuración de Sprint 0

Ruta:

```text id="sprint0-prisma-path"
prisma/schema.prisma
```

Contenido inicial obligatorio:

```prisma id="sprint0-prisma-schema"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Reglas de alcance:

```text id="sprint0-prisma-rule"
- No agregar modelos ni enums en Sprint 0.
- No crear migraciones ni seeds de dominio en Sprint 0.
- Las carpetas prisma/migrations y prisma/seed pueden existir solo como placeholders vacíos.
- Sprint 0 puede ejecutar prisma format y prisma validate como comprobaciones de tooling.
- prisma generate, PrismaService y la conexión desde la aplicación no son criterios de
  cierre de Sprint 0.
- Tenant y sus entidades relacionadas se agregan únicamente con 001-tenants aprobado.
- UserProfile, roles, permisos y memberships se agregan únicamente con
  002-users-roles aprobado.
- La primera migración de dominio se crea junto con la primera spec funcional aprobada,
  no durante el bootstrap técnico.
```

Esta delimitación implementa ADR-003 §11.1 sin modificar la estrategia objetivo de
PostgreSQL, Prisma, shared schema o `tenant_id`.

---

## 17. API health diferida a Sprint 1

Sprint 0 solo configura health checks de los contenedores de infraestructura. No crea
`HealthModule` ni expone un endpoint HTTP de salud desde `apps/api`.

Sprint 1 implementará el contrato autoritativo de ADR-010 §10:

```text id="sprint0-health-contract-reference"
GET /api/v1/health          → liveness pública mínima, payload plano, 200
GET /api/v1/health/details  → readiness protegida, payload plano, 200 o 503
```

Ambos endpoints son excepciones explícitas al success envelope general. Sprint 0 no
implementa ni prueba ese comportamiento HTTP.

---

## 18. Tooling OpenAPI de Sprint 0

Sprint 0 puede instalar dependencias, crear el package cliente vacío y definir scripts
de tooling. No habilita Swagger/OpenAPI en runtime ni expone `/api/v1/docs` o
`/api/v1/docs-json`.

La configuración runtime, los endpoints de documentación, la generación del contrato y
la aplicación de las reglas de `docs/sdd/api-guidelines.md` pertenecen a Sprint 1.

---

## 19. Definition of Done Sprint 0

```text id="sprint0-dod"
[ ] Monorepo creado.
[ ] apps/api creado.
[ ] apps/admin-web creado.
[ ] apps/resident-web creado.
[ ] packages/shared creado.
[ ] packages/config creado.
[ ] packages/auth creado.
[ ] packages/openapi-client creado.
[ ] packages/testing creado.
[ ] Los cinco packages base tienen manifest, TypeScript strict, entrada, exports y scripts aplicables.
[ ] packages/auth no contiene autenticación o autorización runtime.
[ ] packages/openapi-client ejecuta validación real sin cliente de dominio generado.
[ ] packages/testing ejecuta smoke tests y security:secrets real sin fixtures de dominio.
[ ] No existen packages vacíos ni scripts placeholder.
[ ] docs/implementation creado.
[ ] docker-compose.yml creado.
[ ] PostgreSQL local levanta.
[ ] Redis local levanta.
[ ] Keycloak local levanta.
[ ] keycloak-postgres levanta separado de PostgreSQL Core.
[ ] MinIO local levanta.
[ ] MailHog local levanta.
[ ] resident-api levanta como scaffold contenerizado.
[ ] .env.example creado.
[ ] .gitignore creado.
[ ] README.md creado.
[x] AGENTS.md raíz versionado y aplicable a todo el repositorio.
[ ] tsconfig.base.json creado.
[ ] pnpm-workspace.yaml creado.
[ ] .node-version creado con 24.18.0.
[ ] package.json fija packageManager y engines en pnpm 11.21.0 y Node.js 24.18.0.
[ ] CI inicial creado.
[ ] Required CI gates protege main y ejecuta los cinco grupos de ADR-012 §10.
[ ] CI valida install frozen, formato, lint, tipos, pruebas smoke, OpenAPI tooling,
    Prisma schema, Compose config, dependency audit, secretos, builds e imagen resident-api.
[ ] Ningún gate obligatorio usa continue-on-error o pasa por ausencia del script.
[ ] main es la única rama permanente y está configurada como target de CI.
[ ] develop no existe.
[ ] schema.prisma contiene solo generator y datasource.
[ ] No existen modelos, enums, migraciones ni seeds Prisma de dominio.
[ ] Health checks de infraestructura definidos; no existe HealthModule de aplicación.
[ ] Tooling OpenAPI preparado; no existe Swagger/OpenAPI runtime.
[ ] No hay secretos reales.
[ ] No hay datos reales.
[ ] No hay storageKey expuesto.
[ ] No hay WordPress transaccional.
[ ] No hay lógica de negocio productiva implementada todavía.
[ ] No existe API ni persistencia runtime de Implementation Readiness.
```

---

## 20. No aceptación

Sprint 0 no se acepta si:

```text id="sprint0-no-acceptance"
- no se puede instalar el workspace;
- no se puede levantar Docker Compose;
- PostgreSQL no inicia;
- Redis no inicia;
- Keycloak no inicia;
- no existe .env.example;
- existen secretos reales en el repositorio;
- existen datos reales de residentes;
- existen comprobantes reales;
- existen documentos privados reales;
- WordPress aparece como backend transaccional;
- se implementan pagos reales;
- se implementan rutas públicas privadas;
- se expone storageKey;
- no existe CI inicial;
- TypeScript strict no está activo;
- no existe estructura base de apps y packages;
- se implementa lógica de negocio sin la spec y el sprint funcional autorizados.
```

---

## 21. Siguiente paso después de Sprint 0

Una vez completado Sprint 0, avanzar a:

```text id="sprint0-next"
Sprint 1 — Backend Platform Base
```

Con foco en:

```text id="sprint1-preview"
- NestJS API base real;
- ConfigModule;
- ValidationPipe;
- ExceptionFilter;
- Logger sanitizado;
- PrismaService;
- HealthModule;
- OpenAPIModule;
- Auth skeleton;
- Tenant skeleton;
- Audit skeleton;
- estructura modular backend.
```
