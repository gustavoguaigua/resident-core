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

---

## 3. Resultado esperado

Al finalizar Sprint 0 debe existir:

```text id="sprint0-expected-result"
- monorepo creado;
- estructura apps/api, apps/admin-web y apps/resident-web creada;
- packages/shared, packages/config, packages/testing creados;
- docs preservado como fuente SDD;
- Docker Compose local creado;
- PostgreSQL local configurado;
- Redis local configurado;
- Keycloak local configurado;
- NestJS API base creada;
- Next.js admin-web base creada;
- Next.js resident-web base creada;
- Prisma instalado;
- OpenAPI preparado;
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
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Stack base de Sprint 0

```text id="sprint0-stack"
Runtime: Node.js LTS
Package manager: pnpm
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
[ ] Crear .gitignore.
[ ] Crear README.md.
[ ] Crear pnpm-workspace.yaml.
[ ] Crear package.json raíz.
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

---

### 7.4. Infraestructura local

```text id="sprint0-infra-checklist"
[ ] Crear docker-compose.yml.
[ ] Agregar PostgreSQL.
[ ] Agregar Redis.
[ ] Agregar Keycloak.
[ ] Agregar red Docker local.
[ ] Agregar volúmenes locales.
[ ] Agregar health checks básicos.
[ ] Crear infra/keycloak/.
[ ] Crear infra/postgres/.
[ ] Crear infra/local/.
```

---

### 7.5. Backend base

```text id="sprint0-backend-checklist"
[ ] Crear NestJS API.
[ ] Activar TypeScript strict.
[ ] Crear módulo health.
[ ] Crear ConfigModule.
[ ] Crear ValidationPipe global.
[ ] Crear ExceptionFilter base.
[ ] Crear Logger sanitizado base.
[ ] Preparar Swagger/OpenAPI.
[ ] Instalar Prisma.
[ ] Crear schema.prisma inicial.
[ ] Verificar conexión PostgreSQL local.
```

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
[ ] Ejecutar build api.
[ ] Ejecutar build admin-web.
[ ] Ejecutar build resident-web.
[ ] Ejecutar secret scan básico si se configura.
```

---

## 8. Comandos sugeridos de arranque

### 8.1. Crear carpeta base

```bash id="sprint0-cmd-create-root"
mkdir resident-core
cd resident-core
git init
pnpm init
```

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

## 9. package.json raíz sugerido

```json id="sprint0-root-package-json"
{
  "name": "resident-core",
  "version": "0.1.0",
  "private": true,
  "description": "RESIDENT Core - multitenant residential administration platform",
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
    "prisma:migrate": "pnpm --filter @resident/api prisma:migrate",
    "openapi:generate": "pnpm --filter @resident/api openapi:generate"
  },
  "devDependencies": {
    "prettier": "latest"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  }
}
```

Nota:

```text id="sprint0-package-note"
La versión mínima de Node puede ajustarse al LTS que decidas usar localmente. Lo importante es fijarla en el repositorio y mantenerla consistente en CI.
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
KEYCLOAK_RESIDENT_WEB_CLIENT_ID=resident-web

# Frontend
NEXT_PUBLIC_RESIDENT_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=resident
NEXT_PUBLIC_KEYCLOAK_ADMIN_WEB_CLIENT_ID=resident-admin-web
NEXT_PUBLIC_KEYCLOAK_RESIDENT_WEB_CLIENT_ID=resident-web

# Security flags
WORDPRESS_TRANSACTIONAL_BACKEND_ENABLED=false
PUBLIC_ADMIN_ROUTES_ENABLED=false
PUBLIC_RESIDENT_TRANSACTIONAL_ROUTES_ENABLED=false
STORAGE_KEY_EXPOSURE_ENABLED=false
EXTERNAL_AI_REAL_DATA_ENABLED=false
HARDWARE_CONTROL_ENABLED=false
BIOMETRICS_ENABLED=false
```

---

## 13. docker-compose.yml inicial

```yaml id="sprint0-docker-compose"
services:
  postgres:
    image: postgres:16
    container_name: resident-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: resident_core
      POSTGRES_USER: resident
      POSTGRES_PASSWORD: resident_dev_password
    ports:
      - "5432:5432"
    volumes:
      - resident_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U resident -d resident_core"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    container_name: resident-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - resident_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: resident-keycloak
    restart: unless-stopped
    command: start-dev
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin_dev_password
    ports:
      - "8080:8080"
    volumes:
      - resident_keycloak_data:/opt/keycloak/data

volumes:
  resident_postgres_data:
  resident_redis_data:
  resident_keycloak_data:
```

Notas:

```text id="sprint0-docker-notes"
- Este archivo es únicamente para desarrollo local.
- Las credenciales son ficticias.
- No usar estas credenciales en staging ni producción.
- Keycloak deberá endurecerse en ambientes no locales.
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

Contenido sugerido:

```yaml id="sprint0-ci-yml"
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - develop

jobs:
  validate:
    name: Validate repository
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: "9"

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

      - name: Build
        run: pnpm build
```

Nota:

```text id="sprint0-ci-note"
Este pipeline es mínimo. Luego deberá ampliarse con generación OpenAPI, validación Prisma, Docker build, secret scanning y security static checks.
```

---

## 16. Primer schema.prisma base

Ruta:

```text id="sprint0-prisma-path"
prisma/schema.prisma
```

Contenido inicial sugerido:

```prisma id="sprint0-prisma-schema"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique
  name        String
  status      String   @default("active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("tenants")
}

model UserProfile {
  id                String   @id @default(uuid()) @db.Uuid
  keycloakSubjectId String   @unique @map("keycloak_subject_id")
  email             String
  displayName       String   @map("display_name")
  status            String   @default("active")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("user_profiles")
}
```

Regla:

```text id="sprint0-prisma-rule"
Este schema es solo base mínima. Los modelos funcionales deben agregarse después, siguiendo los data-model.md de cada paquete SDD.
```

---

## 17. API health inicial

Endpoint mínimo esperado:

```http id="sprint0-health-endpoint"
GET /api/v1/health
```

Response esperada:

```json id="sprint0-health-response"
{
  "data": {
    "status": "ok",
    "service": "resident-core-api",
    "version": "0.1.0"
  },
  "meta": {
    "traceId": "local-trace-id"
  }
}
```

---

## 18. OpenAPI inicial

Debe quedar preparado para exponer:

```text id="sprint0-openapi"
GET /api/v1/docs
GET /api/v1/docs-json
```

Reglas:

```text id="sprint0-openapi-rules"
- Versionar bajo /api/v1.
- Usar Bearer auth en endpoints protegidos.
- Mantener response envelope.
- Mantener error envelope.
- No documentar endpoints públicos transaccionales.
- No exponer storageKey.
```

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
[ ] docs/implementation creado.
[ ] docker-compose.yml creado.
[ ] PostgreSQL local levanta.
[ ] Redis local levanta.
[ ] Keycloak local levanta.
[ ] .env.example creado.
[ ] .gitignore creado.
[ ] README.md creado.
[ ] tsconfig.base.json creado.
[ ] pnpm-workspace.yaml creado.
[ ] CI inicial creado.
[ ] schema.prisma inicial creado.
[ ] API health definido.
[ ] OpenAPI preparado.
[ ] No hay secretos reales.
[ ] No hay datos reales.
[ ] No hay storageKey expuesto.
[ ] No hay WordPress transaccional.
[ ] No hay lógica de negocio productiva implementada todavía.
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
- se implementa lógica de negocio sin pasar a Sprint 1.
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
