# ADR-012 — CI/CD Strategy: GitHub Actions with Protected Branches, Environment Gates and Progressive Deployment

## 1. Información del documento

| Campo           | Valor                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                |
| Documento       | ADR-012                                                                                                                                                      |
| Título          | CI/CD Strategy: GitHub Actions with Protected Branches, Environment Gates and Progressive Deployment                                                         |
| Ruta            | `docs/decisions/ADR-012-ci-cd-strategy.md`                                                                                                                   |
| Versión         | 0.3                                                                                                                                                          |
| Estado          | accepted                                                                                                                                                     |
| Fecha           | 2026-07-12                                                                                                                                                   |
| Actualización   | 2026-08-11 — `CI-001-single-maintainer-branch-protection.md`                                                                                                  |
| Relacionado con | `ADR-009-deployment-strategy.md`, `ADR-010-observability-strategy.md`, `ADR-011-testing-strategy.md`, `security.md`, `architecture.md`, `data-governance.md` |

---

## 2. Contexto

RESIDENT Core será desarrollado bajo metodología SDD, con arquitectura inicial de monolito modular contenerizado, NestJS, TypeScript, PostgreSQL, Prisma, Redis, Keycloak como Identity Provider objetivo, Docker y despliegue progresivo.

El sistema gestionará datos críticos:

* Datos personales.
* Datos financieros.
* Pagos.
* Comprobantes.
* Estados de cuenta.
* Roles.
* Permisos.
* Auditoría.
* Tenants.
* Integraciones.

Por esta razón, el proceso de integración y despliegue no puede depender de pasos manuales improvisados.

CI/CD debe convertirse en un mecanismo de control de calidad, seguridad y trazabilidad.

---

## 3. Problema

Se debe definir la estrategia de integración continua y despliegue continuo para RESIDENT Core.

La decisión debe responder:

1. ¿Qué herramienta CI/CD se usará inicialmente?
2. ¿Qué ramas tendrá el repositorio?
3. ¿Cómo se protegerá `main`?
4. ¿Qué validaciones se ejecutarán en pull requests?
5. ¿Cómo se construirá la imagen Docker?
6. ¿Cómo se gestionarán secrets?
7. ¿Cómo se desplegará a dev, staging y production?
8. ¿Cómo se controlarán migraciones?
9. ¿Cómo se ejecutarán smoke tests?
10. ¿Cómo se aplicará rollback?
11. ¿Cómo se controlará código generado por IA?
12. ¿Cómo se preparará el proceso para microservicios futuros?

---

## 4. Decisión

RESIDENT Core utilizará inicialmente:

```text id="1r8qol"
GitHub Actions como plataforma CI/CD principal.
```

La estrategia será:

```text id="h8kgpc"
Pull Request
    ↓
CI obligatorio
    ↓
Revisión humana; aprobación independiente cuando exista revisor elegible
    ↓
Merge a main
    ↓
Build Docker
    ↓
Deploy a dev
    ↓
Promoción a staging
    ↓
Validación
    ↓
Aprobación manual
    ↓
Deploy a production
```

La decisión central:

```text id="kbx29q"
Ningún cambio debe llegar a producción sin CI exitoso, revisión y validación en staging.
```

---

## 5. Principios

### 5.1. Main siempre debe estar estable

La rama principal debe representar código listo para release o producción, según el modelo de ramas elegido.

No se debe hacer push directo a `main`.

---

### 5.2. Todo cambio entra por pull request

Todo cambio relevante debe pasar por pull request.

Incluye:

* código;
* documentación SDD;
* ADRs;
* migraciones;
* configuración de infraestructura;
* workflows;
* Dockerfiles;
* scripts;
* cambios de seguridad;
* contratos OpenAPI.

---

### 5.3. CI es obligatorio

El CI debe ejecutar los gates base de §10.1 y los gates de capacidad de §10.2 cuando
apliquen. Esto incluye instalación frozen, formato, lint, tipos, pruebas, OpenAPI,
Prisma, seguridad, build del workspace y build Docker de `resident-api`.

---

### 5.4. Producción requiere aprobación

El despliegue a producción debe requerir aprobación manual, especialmente si incluye:

* migraciones;
* cambios financieros;
* cambios de autenticación;
* cambios de autorización;
* cambios de Keycloak;
* cambios de infraestructura;
* cambios de base de datos.

GitHub permite usar environments con protection rules como aprobaciones manuales, esperas o restricciones de ramas antes de que un job de despliegue avance.

---

### 5.5. Secrets no van al repositorio

Los secretos deben manejarse mediante GitHub Secrets, variables del ambiente o un gestor externo.

GitHub documenta secrets para Actions y environments; además, los environment secrets pueden protegerse con aprobaciones antes de ser accesibles por un job.

---

### 5.6. El pipeline debe proteger contra código generado por IA sin revisión

Los agentes IA pueden producir código útil, pero el código no debe entrar a `main` sin:

* CI exitoso;
* pruebas;
* revisión humana documentada;
* aprobación independiente cuando exista un revisor elegible, conforme a §8.1;
* validación SDD;
* verificación de seguridad;
* revisión de migraciones.

---

## 6. Herramienta CI/CD inicial

### 6.1. GitHub Actions

Se adopta GitHub Actions por:

* integración nativa con GitHub;
* configuración mediante YAML;
* soporte para pull requests;
* soporte para environments;
* soporte para secrets;
* soporte para matrices;
* soporte para runners hospedados o self-hosted;
* integración con Docker;
* integración con GitHub Container Registry;
* facilidad para activar workflows por eventos del repositorio.

GitHub Actions permite automatizar workflows ejecutados por eventos del repositorio y ofrece control de despliegues mediante environments, concurrency y protection rules.

---

### 6.2. Alternativas evaluadas

#### GitLab CI/CD

Ventajas:

* CI/CD muy integrado.
* Buen soporte DevOps.
* Registro de contenedores.
* Variables y environments.

Desventajas:

* Requiere migrar o alojar repositorio en GitLab.
* Menor continuidad si el repositorio principal estará en GitHub.

Resultado:

```text id="fbfj7x"
Descartado para la etapa inicial.
```

---

#### Jenkins

Ventajas:

* Muy flexible.
* Extensible.
* Maduro.
* Autohospedable.

Desventajas:

* Mayor carga operativa.
* Requiere mantenimiento.
* Más complejidad inicial.
* Menos conveniente para MVP individual o equipo pequeño.

Resultado:

```text id="3a0410"
Descartado para MVP.
```

---

#### CircleCI / Buildkite / Drone / Woodpecker

Ventajas:

* Buenas plataformas CI.
* Opciones gestionadas o self-hosted.
* Flexibles.

Desventajas:

* Agregan otro proveedor.
* No son necesarias si GitHub Actions cubre el caso inicial.

Resultado:

```text id="9l36bk"
Diferidas.
```

---

## 7. Estrategia de ramas

### 7.1. Modelo inicial aprobado

RESIDENT Core adopta un flujo trunk-based simple:

```text id="ge66yp"
main        → única rama permanente, estable y releasable
feature/*   → funcionalidades autorizadas
fix/*       → correcciones
docs/*      → documentación
chore/*     → tooling e infraestructura
hotfix/*    → correcciones urgentes posteriores a producción
codex/*     → cambios de agentes, siempre mediante pull request
```

Todas las ramas de trabajo son cortas, nacen de `main` actualizada y vuelven a
`main` mediante pull request.

### 7.2. Ramas no adoptadas inicialmente

```text id="x7pd1c"
develop
release/*
```

`develop` no se crea ni se usa como trigger durante Sprint 0. Incorporar una rama
permanente adicional requiere actualizar este ADR con una necesidad operativa concreta.

### 7.3. Normalización del repositorio existente

El repositorio local inspeccionado usa actualmente `master` y no tiene remoto. Ese
nombre se considera legado pre-Sprint 0. Después de aprobar el baseline documental y
antes de crear el remoto o los workflows, se deberá ejecutar:

```bash id="dij2jt"
git branch -m master main
```

Si al momento de la migración la rama ya se llama `main`, el paso se omite. Después de
crear el remoto se debe publicar `main`, configurarla como rama por defecto y aplicar
protección antes de retirar cualquier referencia remota a `master`. La retirada de una
rama remota exige verificación explícita y no forma parte de esta corrección documental.

---

## 8. Protección de ramas

La rama `main` debe tener branch protection.

Reglas mínimas:

* no push directo;
* pull request obligatorio;
* status checks obligatorios;
* revisión requerida conforme a §8.1;
* branch actualizada antes de merge;
* no permitir bypass salvo emergencia controlada;
* protección para administradores si se considera necesario.

GitHub permite crear reglas de protección de rama para exigir revisiones aprobadas o status checks antes de permitir merge.

### 8.1. Excepción temporal para mantenedor único

Cuando el repositorio tenga un solo mantenedor elegible y todavía no opere ambientes o
datos productivos, exigir una aprobación independiente bloquearía todos los merges sin
producir una revisión real. En esa situación se permite configurar temporalmente cero
aprobaciones requeridas, bajo todas las condiciones siguientes:

* todo cambio continúa entrando mediante pull request;
* `Required CI gates` continúa siendo obligatorio;
* la rama debe estar actualizada con `main` antes del merge;
* la protección se aplica al administrador;
* no se permite bypass;
* force-push y eliminación de `main` permanecen deshabilitados;
* el mantenedor realiza y documenta una revisión humana del diff, la evidencia de CI y
  la trazabilidad SDD antes del merge;
* la ausencia de aprobación independiente se declara explícitamente y no se presenta
  como revisión de un tercero.

Esta excepción no autoriza despliegues a producción, uso de datos reales ni reducción
de gates de seguridad. Cambios financieros, de seguridad, migraciones destructivas o
despliegues productivos requieren revisión externa independiente antes de llegar a
producción.

La excepción termina automáticamente cuando exista un segundo revisor elegible. En ese
momento branch protection debe volver a exigir al menos una aprobación. También debe
reevaluarse antes de habilitar el primer ambiente o despliegue productivo.

---

## 9. Pull requests

Todo PR debe incluir:

* descripción del cambio;
* referencia a spec o ADR;
* impacto en base de datos;
* impacto en seguridad;
* impacto en API;
* impacto en tests;
* impacto en deployment;
* capturas o ejemplos si aplica;
* checklist de revisión.

### 9.1. PR template sugerido

```markdown id="4237gw"
## Summary

## Related SDD/ADR

## Changes

## Security impact

## Data/migration impact

## API impact

## Testing evidence

## Deployment notes

## Rollback notes

## Checklist
- [ ] Spec/ADR updated if needed
- [ ] Tests added/updated
- [ ] OpenAPI updated if needed
- [ ] Migration reviewed if needed
- [ ] No secrets committed
- [ ] Multitenancy considered
- [ ] Authorization considered
- [ ] Financial impact reviewed
```

---

## 10. Validaciones de CI en pull request

Desde Sprint 0, cada pull request y cada push a `main` debe completar el status check
requerido `Required CI gates`, compuesto por cinco grupos:

```text id="yf4cgz"
quality
tests
contracts-data
security
build
```

Ninguno puede usar `continue-on-error`, ignorar un código de salida distinto de cero o
considerarse exitoso porque falta el script correspondiente. Branch protection debe
exigir `Required CI gates` antes del merge.

### 10.1. Gates base obligatorios desde Sprint 0

| Status check | Validaciones obligatorias |
| --- | --- |
| `quality` | install con lockfile, format check, lint y typecheck |
| `tests` | pruebas unitarias/smoke existentes mediante `pnpm test` |
| `contracts-data` | tooling OpenAPI, `prisma validate` y `docker compose config` |
| `security` | dependency audit y secret scan del historial disponible |
| `build` | build del workspace y build de la imagen `resident-api` mediante Compose |

### 10.2. Gates activados por capacidad

Estas suites son obligatorias desde el PR que introduce la capacidad indicada y no se
ejecutan como placeholders vacíos en Sprint 0:

| Capacidad introducida | Gates adicionales obligatorios |
| --- | --- |
| Runtime API/OpenAPI en Sprint 1 | integration/API tests, validación del contrato generado y detección de drift |
| Primera migración Prisma | prueba de migración en base limpia y migration check |
| Tenants, identidad o autorización | authorization y multitenancy tests |
| Módulo financiero | financial regression y audit tests |
| Frontend consumidor | generación/validación del cliente OpenAPI y build del frontend afectado |

La activación se determina por la spec y los archivos afectados. Un gate ya activado no
puede volver a omitirse sin actualizar este ADR.

---

## 11. Pipeline base canónico

Orden lógico obligatorio:

```text id="k7jz09"
1. Checkout
2. Setup Node.js 24.18.0 y pnpm 11.21.0
3. Install dependencies
4. Format check
5. Lint
6. Typecheck
7. Unit/smoke tests
8. OpenAPI tooling validation
9. Prisma schema validation
10. Docker Compose configuration validation
11. Dependency audit
12. Secret scanning
13. Build workspace
14. Build resident-api image with Docker Compose
15. Capability gates when applicable
```

---

## 12. Comandos canónicos

Los comandos base de Sprint 0 son:

```bash id="y8r6qu"
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:validate
pnpm prisma:validate
docker compose config --quiet
pnpm security:dependencies
pnpm security:secrets
pnpm build
docker compose build resident-api
```

`pnpm openapi:validate` valida en Sprint 0 el tooling y su configuración, sin exigir un
contrato runtime todavía. `pnpm prisma:validate` valida el schema de configuración sin
migraciones. Ambos comandos se amplían, sin cambiar de nombre, cuando sus artefactos
runtime existan.

`security:dependencies` ejecuta como mínimo `pnpm audit --audit-level high`.
`security:secrets` ejecuta una herramienta aprobada y versionada sobre todo el historial
disponible; un placeholder o scanner ausente no satisface el gate. Suites de capacidad
usan los comandos `test:integration`, `test:api`, `test:authorization`,
`test:multitenancy`, `test:financial` y `prisma:migrate:check` cuando sean activadas.

---

## 13. Workflows sugeridos

### 13.1. `ci.yml`

Ejecuta validaciones en pull requests y pushes.

```text id="mm69i9"
.github/workflows/ci.yml
```

Incluye:

* los cinco grupos de gates de §10;
* todos los gates base de Sprint 0;
* gates de capacidad cuando apliquen.

---

### 13.2. `docker-build.yml`

Construye imagen Docker.

```text id="zxtsos"
.github/workflows/docker-build.yml
```

Incluye:

* build;
* tag;
* push a registry;
* scan opcional.

---

### 13.3. `deploy-dev.yml`

Despliega a ambiente dev.

```text id="frg9bj"
.github/workflows/deploy-dev.yml
```

Puede activarse automáticamente desde `main` o manualmente.

---

### 13.4. `deploy-staging.yml`

Despliega a staging.

Debe incluir:

* migraciones;
* smoke tests;
* health checks;
* validación de Keycloak si aplica;
* validación de WordPress/n8n si aplica.

---

### 13.5. `deploy-production.yml`

Despliega a producción.

Debe requerir:

* environment `production`;
* aprobación manual;
* backup previo si hay migraciones;
* smoke tests post-deploy;
* rollback plan.

---

### 13.6. `docs.yml`

Valida documentación técnica.

Incluye:

* existencia de ADRs;
* estructura SDD;
* enlaces internos;
* formato markdown;
* consistencia básica.

---

## 14. GitHub Environments

Se deben usar environments:

```text id="lcairi"
development
staging
production
```

Cada environment debe tener:

* secrets propios;
* variables propias;
* reglas de despliegue;
* restricciones de ramas;
* aprobaciones donde corresponda.

Para `production`, se deben usar required reviewers.

Los deployment protection rules de GitHub pueden requerir aprobación manual, temporizador de espera, ramas permitidas o reglas personalizadas antes de que un job avance.

---

## 15. Secrets

### 15.1. Tipos de secrets

Separar:

```text id="pmqstc"
repository secrets
environment secrets
organization secrets
```

### 15.2. Secrets por ambiente

Ejemplos:

```text id="mo2jy9"
DATABASE_URL_DEV
DATABASE_URL_STAGING
DATABASE_URL_PRODUCTION
REDIS_URL
KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
DEPLOY_SSH_KEY
REGISTRY_TOKEN
```

### 15.3. Reglas

* no imprimir secrets;
* no versionar `.env`;
* usar `.env.example`;
* rotar secrets expuestos;
* limitar acceso;
* usar environment secrets para production;
* proteger production secrets con aprobación;
* no compartir secrets con agentes IA;
* no incluir secrets en Docker image.

---

## 16. Variables no secretas

Variables no sensibles pueden manejarse como variables de entorno.

Ejemplos:

```text id="jm15rv"
APP_ENV
LOG_LEVEL
API_BASE_URL
KEYCLOAK_ISSUER
KEYCLOAK_JWKS_URL
KEYCLOAK_REALM
KEYCLOAK_API_AUDIENCE
KEYCLOAK_ADMIN_WEB_CLIENT_ID
KEYCLOAK_RESIDENT_WEB_CLIENT_ID
CORS_ALLOWED_ORIGINS
STORAGE_BUCKET
```

Aun si no son secretas, deben documentarse.

---

## 17. Build Docker

La imagen Docker debe construirse en CI.

Reglas:

* usar Node.js `24.18.0`;
* usar pnpm `11.21.0`;
* usar lockfile;
* usar multi-stage build si aplica;
* no incluir secrets;
* no incluir archivos innecesarios;
* ejecutar como usuario no root cuando sea viable;
* etiquetar con SHA;
* etiquetar con versión;
* publicar en registry definido;
* escanear vulnerabilidades en fase posterior.

Tags sugeridos:

```text id="1ig1t4"
resident-api:sha-abc123
resident-api:0.1.0
resident-api:staging
resident-api:production-2026-07-12
```

---

## 18. Registry de imágenes

Opciones:

```text id="llshor"
GitHub Container Registry
Docker Hub
AWS ECR
Registry del proveedor
```

Decisión inicial:

```text id="4pn0wh"
Usar GitHub Container Registry o el registry del proveedor elegido.
```

Si se migra a AWS, evaluar AWS ECR.

---

## 19. Migraciones en CI/CD

Las migraciones deben tratarse con cuidado.

### 19.1. En pull request

Validar:

* migración generada;
* migración aplicable en base limpia;
* migración no destructiva sin advertencia;
* schema actualizado;
* Prisma Client generado;
* tests pasan.

### 19.2. En staging

Ejecutar migración real contra staging antes de producción.

### 19.3. En production

Antes de migrar:

```text id="sw8x7k"
1. Confirmar CI exitoso.
2. Confirmar staging exitoso.
3. Crear backup.
4. Validar plan de rollback.
5. Ejecutar migración.
6. Ejecutar smoke tests.
7. Registrar evidencia.
```

Regla:

```text id="5ke7wl"
No se ejecuta migración crítica en producción sin backup previo.
```

---

## 20. Financial gates

Si un cambio afecta módulos financieros, el pipeline debe ejecutar pruebas reforzadas.

Módulos financieros:

* dues;
* fees;
* charges;
* payments;
* account statements;
* reconciliation;
* adjustments;
* reports financial;
* fines con impacto financiero;
* reservations con cobro.

Validaciones obligatorias:

```text id="bu17e8"
financial regression tests
migration check
authorization tests
multitenancy tests
audit tests
```

---

## 21. Security gates

El pipeline debe incluir controles de seguridad.

Iniciales:

* secret scanning;
* dependency audit;
* lint;
* typecheck;
* test authorization;
* test multitenancy;
* Docker build sin secrets;
* revisión de permisos.

Posteriores:

* SAST;
* container image scanning;
* OWASP ZAP para staging;
* IaC scanning;
* license scanning.

---

## 22. OpenAPI gates

Si cambia API:

* regenerar OpenAPI;
* validar schema;
* validar contratos;
* revisar breaking changes;
* actualizar documentación;
* ejecutar API tests.

Regla:

```text id="ri1cyh"
No se acepta cambio de endpoint sin spec y OpenAPI actualizados.
```

---

## 23. SDD gates

Cada PR debe indicar su relación con:

* spec;
* ADR;
* bug;
* tarea técnica;
* mejora documental.

Si el cambio implementa una spec:

* debe existir `spec.md`;
* debe existir `tasks.md`;
* debe existir `test-plan.md`;
* los criterios de aceptación deben estar cubiertos.

Regla:

```text id="5fg6i4"
Código sin trazabilidad SDD no debe entrar a main salvo hotfix documentado.
```

---

## 24. Código generado por IA

El uso de IA es permitido, pero controlado.

Reglas:

1. El PR debe indicar si hubo generación sustancial por IA.
2. El código generado por IA debe pasar CI.
3. Debe tener pruebas.
4. No debe introducir secrets.
5. No debe omitir tenant.
6. No debe omitir autorización.
7. No debe eliminar auditoría.
8. No debe cambiar reglas financieras sin pruebas.
9. No debe modificar migraciones sin revisión humana.
10. No debe reemplazar revisión técnica; bajo la excepción de §8.1, el mantenedor debe
    revisar y documentar personalmente el resultado generado antes del merge.

---

## 25. Despliegue a development

Puede ser automático.

Condiciones:

* merge a `main`;
* CI exitoso;
* build exitoso;
* migraciones no críticas;
* environment `development`.

Después de deploy:

* health check;
* smoke test básico;
* logs revisados si falla.

---

## 26. Despliegue a staging

Debe ser controlado.

Condiciones:

* CI exitoso;
* imagen Docker versionada;
* migraciones revisadas;
* environment `staging`;
* datos no productivos;
* smoke tests;
* E2E críticos;
* integración Keycloak si aplica;
* integración WordPress/n8n si aplica.

---

## 27. Despliegue a production

Debe ser protegido.

Condiciones:

* staging exitoso;
* aprobación manual;
* backup si hay migración;
* release notes;
* imagen versionada;
* secrets correctos;
* smoke tests post-deploy;
* rollback plan.

Producción debe usar environment `production` con reviewers requeridos.

---

## 28. Smoke tests post-deploy

Después de cada despliegue:

```text id="j6f9i7"
GET /api/v1/health
GET /api/v1/public/tenants/{slug}
login/token validation
tenant selection
basic protected endpoint
database connectivity
redis connectivity
worker status
keycloak status if applicable
storage status
```

No ejecutar pruebas destructivas en producción.

---

## 29. Rollback

Debe existir rollback documentado.

Rollback de aplicación:

```text id="4srvle"
redeploy imagen anterior
```

Rollback de base de datos:

```text id="rwpwnd"
migración compensatoria o restore controlado
```

Rollback de configuración:

```text id="cp3dcy"
restaurar versión anterior de variables/config/gateway
```

Rollback de Keycloak:

```text id="lo58nt"
restaurar realm config o backup DB según severidad
```

Regla:

```text id="efhxjn"
Rollback de datos financieros requiere análisis antes de ejecutar restore destructivo.
```

---

## 30. Release notes

Cada release debe registrar:

* versión;
* fecha;
* commit SHA;
* cambios;
* specs incluidas;
* migraciones;
* riesgos;
* rollback;
* autor;
* aprobador;
* evidencias de staging;
* smoke tests.

Formato sugerido:

```text id="dkurps"
docs/releases/2026-07-12-v0.1.0.md
```

---

## 31. Versionamiento

Versión inicial sugerida:

```text id="8rp3fd"
0.x durante MVP
1.0 primera versión estable productiva
```

SemVer recomendado:

```text id="d7skbt"
MAJOR.MINOR.PATCH
```

Ejemplo:

```text id="o8shz8"
0.1.0
0.2.0
1.0.0
```

---

## 32. Concurrency

Los workflows de despliegue deben evitar despliegues simultáneos al mismo ambiente.

Regla:

```text id="b4wi85"
Solo un deploy por ambiente a la vez.
```

GitHub Actions permite controlar despliegues con concurrency groups.

---

## 33. Runners

### 33.1. GitHub-hosted runners

Recomendados para MVP.

Ventajas:

* cero mantenimiento;
* integración simple;
* suficientes para CI inicial;
* seguros para builds genéricos.

### 33.2. Self-hosted runners

Evaluar si:

* se requiere acceso a red privada;
* se desea reducir costos;
* se requiere hardware específico;
* se requiere despliegue dentro de infraestructura cerrada.

GitHub documenta que los self-hosted runners se conectan a GitHub para recibir trabajos y pueden ejecutarse en infraestructura propia.

Riesgo:

```text id="gkh70g"
Self-hosted runners requieren hardening, aislamiento y mantenimiento.
```

---

## 34. CI/CD y Keycloak

Cuando Keycloak se incorpore:

Validar en CI/staging:

* realm import;
* clients;
* redirect URIs;
* token validation;
* issuer;
* audience;
* service accounts;
* roles técnicos;
* secrets;
* health endpoint;
* admin config protegida.

No desplegar cambios de Keycloak sin respaldo de configuración.

---

## 35. CI/CD y WordPress

WordPress pertenece a FASE 1 y no debe mezclarse con el pipeline del Core salvo integraciones.

Pruebas de integración:

* endpoint público del tenant;
* CORS;
* acceso a login con slug;
* no exposición de datos sensibles;
* no dependencia de base de WordPress.

---

## 36. CI/CD y n8n

Si n8n participa:

* versionar workflows exportados cuando sea posible;
* probar webhooks en staging;
* validar service account;
* validar scopes;
* validar idempotencia;
* validar errores;
* no usar credenciales reales en pruebas;
* no conectar n8n a PostgreSQL productivo.

---

## 37. CI/CD y observabilidad

Cada deploy debe generar eventos observables:

* release version;
* commit SHA;
* ambiente;
* actor;
* fecha;
* resultado;
* duración;
* errores;
* rollback si aplica.

El sistema debe permitir correlacionar errores con versión desplegada.

---

## 38. CI/CD y documentación

Los cambios de documentación deben entrar por PR.

Documentación crítica:

* SDD.
* ADRs.
* Specs.
* API contracts.
* Data models.
* Test plans.
* Runbooks.
* Release notes.

Regla:

```text id="am61vv"
Si cambia una decisión técnica, debe cambiar el ADR correspondiente o crearse uno nuevo.
```

---

## 39. Estructura sugerida

```text id="fcl6k2"
.github/
└── workflows/
    ├── ci.yml
    ├── docker-build.yml
    ├── deploy-dev.yml
    ├── deploy-staging.yml
    ├── deploy-production.yml
    ├── docs.yml
    └── security.yml
```

---

## 40. Ejemplo conceptual de pipeline

```yaml id="wud6xn"
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    name: Required CI gates
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          version: '11.21.0'

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24.18.0'
          cache: 'pnpm'

      - name: Install
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

El workflow final puede separar los cinco grupos en jobs independientes; en ese caso
todos deben ser status checks requeridos. No puede reducir validaciones sin actualizar
este ADR.

---

## 41. Ejemplo conceptual de production deployment

```yaml id="nd52kv"
name: Deploy Production

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    concurrency:
      group: production
      cancel-in-progress: false

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Deploy
        run: ./scripts/deploy-production.sh

      - name: Smoke tests
        run: ./scripts/smoke-tests.sh
```

El environment `production` deberá tener required reviewers y secrets propios.

---

## 42. Hotfix

Los hotfixes deben ser excepcionales.

Flujo:

```text id="6pp17q"
hotfix/*
    ↓
CI mínimo obligatorio
    ↓
review
    ↓
deploy staging si el tiempo lo permite
    ↓
approval
    ↓
production
    ↓
postmortem
    ↓
actualizar tests/spec si faltaban
```

No se debe usar hotfix para saltar controles sin justificación.

---

## 43. Incidentes por deploy

Si un deploy causa incidente:

1. Detener nuevos deploys.
2. Evaluar rollback.
3. Revisar logs y métricas.
4. Identificar commit.
5. Corregir.
6. Agregar prueba de regresión.
7. Documentar incidente.
8. Ajustar pipeline si faltó control.

---

## 44. Políticas de aprobación

### 44.0. Aplicación según disponibilidad de revisores

Las revisiones técnicas de este apartado son independientes por defecto. Mientras esté
activa la excepción de mantenedor único de §8.1, una revisión humana documentada por el
mantenedor satisface el gate de integración no productiva. No sustituye la revisión
externa exigida antes de producción para cambios financieros, de seguridad, migraciones
destructivas o despliegues productivos.

### 44.1. Cambios normales

Requieren:

* CI exitoso;
* al menos una revisión técnica.

### 44.2. Cambios financieros

Requieren:

* CI exitoso;
* pruebas financieras;
* revisión técnica;
* revisión de migración si aplica.

### 44.3. Cambios de seguridad

Requieren:

* CI exitoso;
* revisión técnica;
* revisión de seguridad;
* pruebas negativas.

### 44.4. Cambios de producción

Requieren:

* staging exitoso;
* approval manual;
* rollback plan.

---

## 45. Evidencia de despliegue

Cada despliegue debe dejar evidencia:

* workflow run;
* logs;
* commit SHA;
* imagen desplegada;
* ambiente;
* aprobador;
* hora;
* resultado;
* smoke tests;
* migraciones ejecutadas;
* release notes.

---

## 46. Microservicios futuros

Cuando existan microservicios:

* CI por servicio;
* contract tests;
* build Docker por servicio;
* deploy independiente;
* versionamiento por servicio;
* compatibility tests;
* API Gateway config validation;
* shared libraries versioning;
* OpenTelemetry validation;
* service-to-service auth tests.

Regla:

```text id="xdcmbk"
Un microservicio no se despliega si rompe contratos publicados.
```

---

## 47. Riesgos

| Riesgo                        | Impacto    | Mitigación                    |
| ----------------------------- | ---------- | ----------------------------- |
| Push directo a main           | Alto       | Branch protection             |
| Deploy sin tests              | Crítico    | Required checks               |
| Secrets filtrados             | Crítico    | Secrets management y scanning |
| Migración destructiva         | Crítico    | Staging, backup, approval     |
| Código IA sin revisión        | Alto       | PR + CI + review              |
| Mantenedor único sin revisión independiente | Alto | Excepción §8.1, CI obligatorio y revisión externa antes de producción |
| Producción sin rollback       | Alto       | Release plan                  |
| Deploy simultáneo             | Medio-alto | Concurrency                   |
| Environment secrets expuestos | Alto       | Required reviewers            |
| Tests lentos bloquean flujo   | Medio      | Suites separadas              |
| PR sin spec                   | Medio-alto | SDD gate                      |
| OpenAPI roto                  | Alto       | Contract validation           |
| Deploy manual improvisado     | Alto       | Scripts y workflow            |

---

## 48. Consecuencias positivas

Esta decisión permite:

* control de calidad automático;
* reducción de errores humanos;
* trazabilidad de releases;
* protección de producción;
* validación de código generado por IA;
* despliegue reproducible;
* mejor seguridad;
* validación de migraciones;
* camino claro a staging/production;
* preparación para microservicios.

---

## 49. Consecuencias negativas

Esta decisión implica:

* tiempo inicial configurando workflows;
* mantenimiento de pipelines;
* posible lentitud de CI;
* necesidad de secrets bien administrados;
* disciplina en PRs;
* aprobación manual para producción;
* necesidad de ajustar pipelines al crecer el monorepo.

---

## 50. Criterios de aceptación

La estrategia se considera implementada si:

* existe `.github/workflows/ci.yml`;
* los pull requests ejecutan CI;
* `main` está protegida;
* los status checks son obligatorios;
* no hay push directo a main;
* existe build Docker;
* existen environments separados;
* production requiere aprobación;
* secrets están fuera del repositorio;
* migraciones se validan en staging;
* producción tiene smoke tests;
* existe rollback documentado;
* cambios financieros ejecutan pruebas reforzadas;
* cambios API validan OpenAPI;
* código generado por IA pasa CI y revisión conforme a §8.1;
* release notes se generan para producción.

---

## Alternativas consideradas

- Integración y despliegue manuales: descartados por falta de gates, evidencia y reproducibilidad.
- Push directo a la rama principal: descartado porque evita revisión y controles obligatorios.
- Otra plataforma CI/CD desde el inicio: no adoptada debido a la integración directa del repositorio con GitHub; podrá reevaluarse mediante ADR si cambia el alojamiento.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-009-deployment-strategy.md`
- `docs/decisions/ADR-010-observability-strategy.md`
- `docs/decisions/ADR-011-testing-strategy.md`

## 51. Decisión final

RESIDENT Core adoptará GitHub Actions como plataforma inicial de CI/CD.

El proceso usará pull requests, branch protection, status checks, tests automatizados, build Docker, environments, secrets por ambiente, aprobación manual para producción y smoke tests post-deploy.

El pipeline será un mecanismo obligatorio de control SDD, seguridad, calidad, multitenancy, autorización y consistencia financiera.

Ningún cambio deberá llegar a producción sin CI exitoso, validación en staging, aprobación correspondiente, plan de rollback y evidencia de despliegue.
