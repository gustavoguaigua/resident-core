# ADR-009 — Deployment Strategy: Progressive Deployment from Docker Compose to Managed Cloud

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                       |
| Documento       | ADR-009                                                                                                                                                                                                                             |
| Título          | Deployment Strategy: Progressive Deployment from Docker Compose to Managed Cloud                                                                                                                                                    |
| Ruta            | `docs/decisions/ADR-009-deployment-strategy.md`                                                                                                                                                                                     |
| Versión         | 0.1                                                                                                                                                                                                                                 |
| Estado          | Aceptado inicialmente                                                                                                                                                                                                               |
| Fecha           | 2026-07-12                                                                                                                                                                                                                          |
| Relacionado con | `ADR-001-architecture-style.md`, `ADR-002-backend-framework.md`, `ADR-003-database-strategy.md`, `ADR-006-identity-provider-strategy.md`, `ADR-008-api-gateway-strategy.md`, `architecture.md`, `security.md`, `data-governance.md` |

---

## 2. Contexto

RESIDENT Core iniciará como un monolito modular contenerizado, API-first, desarrollado con NestJS, TypeScript, PostgreSQL, Prisma, Redis, Docker y Keycloak como proveedor objetivo de identidad.

El sistema debe poder ejecutarse en varios entornos:

* Local.
* Dev.
* Staging.
* Production.
* Ambientes temporales de prueba.
* Ambientes futuros para microservicios.

El proyecto debe mantener bajo costo inicial, pero sin bloquear su evolución hacia una arquitectura más robusta.

La estrategia de despliegue debe permitir:

* Desarrollo local reproducible.
* Pruebas previas a producción.
* Despliegue productivo inicial económico.
* Incorporación progresiva de Keycloak.
* PostgreSQL confiable.
* Backups.
* Observabilidad.
* Seguridad.
* CI/CD.
* Evolución futura hacia AWS ECS, Kubernetes u otra plataforma administrada.

---

## 3. Problema

Se debe definir cómo desplegar RESIDENT Core durante sus distintas fases.

La decisión debe responder:

1. ¿Cómo se ejecutará localmente?
2. ¿Cómo se desplegará en dev?
3. ¿Cómo se desplegará en staging?
4. ¿Cómo se desplegará en producción inicial?
5. ¿Cuándo conviene usar servicios administrados?
6. ¿Cómo se incorporará Keycloak?
7. ¿Cómo se protegerá PostgreSQL?
8. ¿Cómo se manejarán secretos?
9. ¿Cómo se automatizarán despliegues?
10. ¿Cómo se preparará el camino hacia microservicios?

---

## 4. Decisión

RESIDENT Core adoptará una estrategia progresiva de despliegue:

```text id="43grhk"
Fase 1:
Docker Compose local para desarrollo reproducible.

Fase 2:
Dev/Staging en VPS, PaaS o cloud simple con contenedores.

Fase 3:
Producción inicial económica con contenedores, PostgreSQL protegido, backups y reverse proxy.

Fase 4:
Servicios administrados para PostgreSQL, storage, logs y secretos cuando exista carga real.

Fase 5:
AWS ECS/Fargate, Kubernetes o alternativa equivalente cuando existan microservicios o necesidades operativas mayores.
```

Decisión central:

```text id="vowmop"
No iniciar con infraestructura compleja antes de validar el MVP.
No desplegar producción sin backups, HTTPS, secrets management y staging.
```

---

## 5. Principios de despliegue

### 5.1. Reproducibilidad

Todo entorno debe poder recrearse desde configuración versionada.

Esto incluye:

* Dockerfiles.
* Docker Compose.
* Variables de entorno documentadas.
* Migraciones.
* Seeds.
* Scripts.
* Configuración de reverse proxy.
* Configuración inicial de Keycloak.
* Configuración de CI/CD.

---

### 5.2. Paridad entre entornos

Local, dev, staging y production deben ser lo más parecidos posible en estructura.

No necesariamente iguales en tamaño o costo, pero sí en:

* runtime;
* versión de Node.js;
* PostgreSQL;
* Redis;
* variables;
* migraciones;
* flujo de build;
* autenticación;
* configuración de API;
* estructura de servicios.

---

### 5.3. Producción no es laboratorio

Los cambios deben pasar por staging antes de producción.

No se debe ejecutar manualmente una migración crítica directamente en producción sin validación previa.

---

### 5.4. Bajo costo inicial, sin deuda crítica

RESIDENT debe evitar sobrearquitectura, pero no debe comprometer:

* seguridad;
* backups;
* integridad financiera;
* aislamiento multitenant;
* trazabilidad;
* posibilidad de recuperación;
* control de secretos.

---

### 5.5. Contenedores como unidad base

Los servicios principales se ejecutarán como contenedores.

Esto permitirá:

* desarrollo local reproducible;
* despliegue en VPS;
* despliegue en PaaS;
* despliegue en ECS;
* despliegue futuro en Kubernetes;
* separación progresiva de servicios.

---

## 6. Ambientes definidos

### 6.1. Local

Ambiente usado por el desarrollador.

Objetivos:

* desarrollo;
* pruebas rápidas;
* ejecución de specs;
* pruebas de integración;
* generación de migraciones;
* pruebas con Keycloak local;
* pruebas con Mailhog/MinIO.

Debe poder levantarse con:

```bash id="hd2xy9"
docker compose up
```

Docker Compose permite definir y ejecutar aplicaciones multicontenedor con un archivo Compose, por lo que es adecuado para levantar localmente API, PostgreSQL, Redis, Keycloak y servicios auxiliares de RESIDENT.

---

### 6.2. Dev

Ambiente compartido de desarrollo.

Objetivos:

* validar integración;
* probar despliegues automáticos;
* probar endpoints;
* ejecutar migraciones no productivas;
* probar flujos con Keycloak;
* probar integración inicial con WordPress/n8n.

Características:

* datos ficticios;
* credenciales separadas;
* dominio o subdominio propio;
* despliegue automático desde rama de desarrollo;
* logs básicos;
* sin datos reales.

---

### 6.3. Staging

Ambiente previo a producción.

Objetivos:

* validar releases;
* probar migraciones;
* probar backups/restores;
* probar Keycloak en modo productivo;
* probar WordPress integration;
* probar n8n;
* ejecutar pruebas E2E;
* validar CORS, gateway, TLS, redirects y dominios.

Características:

* configuración similar a producción;
* datos simulados realistas o anonimizados;
* despliegue controlado;
* backups de prueba;
* monitoreo básico;
* no debe usarse como entorno de desarrollo improvisado.

---

### 6.4. Production

Ambiente real.

Objetivos:

* operación de tenants reales;
* datos personales;
* datos financieros;
* pagos;
* comprobantes;
* auditoría;
* disponibilidad estable;
* recuperación ante fallos.

Características mínimas:

* HTTPS;
* reverse proxy;
* PostgreSQL protegido;
* backups;
* secrets seguros;
* logs;
* monitoreo;
* migraciones controladas;
* storage privado;
* Keycloak endurecido cuando se incorpore;
* política de incidentes.

---

## 7. Arquitectura local inicial

Docker Compose local deberá levantar, como mínimo:

```text id="l0dlhh"
resident-api
postgres
redis
mailhog
minio
```

Con Keycloak:

```text id="7y12hf"
resident-api
postgres
redis
keycloak
keycloak-postgres
mailhog
minio
reverse-proxy opcional
```

Estructura conceptual:

```text id="bg6yr8"
Developer Machine
├── resident-api:3000
├── postgres:5432
├── redis:6379
├── keycloak:8080
├── keycloak-postgres:5433
├── minio:9000
└── mailhog:8025
```

---

## 8. Servicios del sistema

### 8.1. Servicios obligatorios MVP

```text id="eglkyv"
resident-api
postgres
redis
reverse-proxy
```

### 8.2. Servicios recomendados MVP

```text id="ukvblv"
mailhog en local/dev
minio o storage compatible S3 en local/dev
worker para jobs asíncronos
```

### 8.3. Servicios con Keycloak

```text id="lsbvce"
keycloak
keycloak-db
```

Keycloak en producción requiere configuración explícita de hostname y normalmente se despliega detrás de un reverse proxy o load balancer; su documentación señala que el hostname no se resuelve dinámicamente por seguridad y que la configuración productiva suele incluir reverse proxy/load balancer.

---

## 9. Arquitectura de producción inicial económica

La producción inicial podrá desplegarse en:

```text id="pkia5y"
VPS con Docker
PaaS con soporte para contenedores
Cloud simple con contenedores
AWS Lightsail / EC2 pequeño
DigitalOcean Droplet / App Platform
Render / Railway / Fly.io o equivalente
```

La decisión final del proveedor se tomará posteriormente según:

* costo mensual;
* facilidad de despliegue;
* soporte para PostgreSQL;
* soporte para storage;
* soporte para backups;
* ubicación;
* escalabilidad;
* experiencia operativa;
* integración con dominios;
* soporte para contenedores;
* facilidad para Keycloak.

---

## 10. Producción inicial mínima aceptable

No se debe considerar producción si no existe:

```text id="33zfjz"
HTTPS
reverse proxy
PostgreSQL protegido
backups automáticos
secrets fuera del repositorio
logs de aplicación
migraciones controladas
storage privado
health checks
mecanismo de rollback
monitoreo básico
```

---

## 11. Estrategia de contenedores

### 11.1. Imagen de API

El backend deberá construirse como imagen Docker.

Requisitos:

* usar Node.js LTS;
* instalar dependencias con lockfile;
* compilar TypeScript;
* no incluir archivos innecesarios;
* no incluir secretos;
* ejecutar como usuario no root cuando sea viable;
* exponer puerto interno controlado;
* usar health check;
* separar build y runtime si se usa multi-stage build.

---

### 11.2. Imagen de worker

Si existen jobs asíncronos, se recomienda separar:

```text id="02igwv"
resident-api
resident-worker
```

Aunque usen el mismo código base, tendrán comandos de ejecución distintos.

Ejemplo:

```text id="cvwogi"
resident-api     → npm run start:prod
resident-worker  → npm run worker:prod
```

---

### 11.3. Versionamiento de imágenes

Las imágenes deben etiquetarse con:

```text id="s0kgr0"
git commit SHA
semantic version
environment tag
```

Ejemplo:

```text id="hfa1vc"
resident-api:0.1.0
resident-api:2026-07-12
resident-api:sha-abc123
```

---

## 12. Base de datos

### 12.1. Local

PostgreSQL en Docker.

Permitido:

* reset;
* seeds;
* datos ficticios;
* migraciones frecuentes.

### 12.2. Dev/Staging

PostgreSQL separado por ambiente.

No compartir base entre dev, staging y production.

### 12.3. Producción inicial

Opciones:

```text id="am4m7c"
PostgreSQL en contenedor con volumen persistente
PostgreSQL administrado por proveedor
PostgreSQL en VM separada
```

Para producción real con varios tenants, se recomienda migrar a PostgreSQL administrado cuando el presupuesto lo permita.

Amazon RDS for PostgreSQL gestiona tareas administrativas como instalación, upgrades, almacenamiento y backups de PostgreSQL, por lo que es una opción futura razonable cuando RESIDENT migre hacia AWS o requiera operación administrada.

---

## 13. Redis

Redis se usará para:

* cache;
* colas;
* rate limiting;
* sesiones técnicas si aplica;
* jobs con BullMQ o equivalente.

Reglas:

* no almacenar secretos en Redis;
* no almacenar comprobantes;
* usar claves con tenant cuando aplique;
* proteger acceso en producción;
* no exponer Redis públicamente;
* configurar persistencia solo si el caso lo requiere;
* limpiar jobs antiguos según política.

---

## 14. Storage

El sistema requerirá almacenamiento privado para:

* comprobantes de pago;
* evidencias de multas;
* actas;
* documentos administrativos;
* reportes exportados;
* archivos temporales.

Opciones:

```text id="j805bi"
Local/dev: MinIO
Producción inicial: S3-compatible storage
AWS futuro: Amazon S3
Proveedor alternativo: Cloudflare R2, Backblaze B2, DigitalOcean Spaces o equivalente
```

Reglas:

* no usar WordPress como repositorio de comprobantes financieros;
* no guardar archivos sensibles en rutas públicas;
* usar URLs firmadas o descarga autenticada;
* separar por tenant;
* auditar acceso a documentos sensibles.

---

## 15. Keycloak deployment

### 15.1. Local

Keycloak puede ejecutarse en modo desarrollo local.

Objetivo:

* probar login;
* probar clients;
* probar tokens;
* probar integración con API;
* probar realms;
* probar mappers.

### 15.2. Staging/Production

Keycloak debe configurarse en modo productivo.

Requisitos:

* base de datos persistente;
* hostname correcto;
* reverse proxy o load balancer;
* HTTPS;
* secrets seguros;
* admin protegido;
* backups;
* health checks;
* logs;
* configuración exportable;
* MFA para administradores;
* redirect URIs explícitas.

La documentación oficial de Keycloak indica que en producción debe configurarse hostname y que normalmente se usa reverse proxy/load balancer; además, recomienda no exponer el puerto de administración/health/metrics directamente a clientes externos.

---

## 16. Reverse proxy / edge proxy

Según `ADR-008`, staging y production deben tener reverse proxy o edge proxy.

Responsabilidades:

* HTTPS;
* routing;
* headers de seguridad;
* CORS;
* límites de tamaño;
* logs;
* health checks;
* rate limiting básico;
* forwarding de request ID;
* routing hacia API y Keycloak.

Herramientas posibles:

```text id="zypd0u"
Nginx
Traefik
Caddy
Cloudflare proxy
Load Balancer del proveedor
```

---

## 17. Dominios

### 17.1. Producción sugerida

```text id="m9ktsi"
www.resident.gustavoguaigua.com  → WordPress portal actual
app.resident.example.com         → frontend Core futuro
api.resident.example.com         → RESIDENT Core API
auth.resident.example.com        → Keycloak
admin.resident.example.com       → administración plataforma futura
```

### 17.2. Staging sugerido

```text id="wt3pz5"
staging-app.resident.example.com
staging-api.resident.example.com
staging-auth.resident.example.com
```

### 17.3. Dev sugerido

```text id="il9hy9"
dev-app.resident.example.com
dev-api.resident.example.com
dev-auth.resident.example.com
```

Los dominios definitivos se definirán cuando se confirme proveedor de hosting y estrategia DNS.

---

## 18. Variables de entorno

Cada ambiente debe tener variables separadas.

Ejemplos:

```text id="p0vv6h"
NODE_ENV
APP_ENV
PORT
DATABASE_URL
REDIS_URL
JWT_ISSUER
KEYCLOAK_ISSUER
KEYCLOAK_CLIENT_ID
KEYCLOAK_CLIENT_SECRET
STORAGE_ENDPOINT
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
CORS_ALLOWED_ORIGINS
LOG_LEVEL
```

Reglas:

* no versionar `.env` con secretos;
* versionar `.env.example`;
* separar secretos por ambiente;
* rotar secretos si se exponen;
* no imprimir variables sensibles en logs.

---

## 19. Secrets management

### 19.1. MVP

Permitido:

```text id="30zi6i"
Variables de entorno protegidas por proveedor.
Archivos .env locales no versionados.
Secrets de GitHub Actions para CI/CD.
```

### 19.2. Producción avanzada

Recomendado:

```text id="kjmgp7"
AWS Secrets Manager
AWS Systems Manager Parameter Store
Doppler
Vault
1Password Secrets Automation
Proveedor equivalente
```

### 19.3. Reglas

* secretos fuera de Git;
* mínimo privilegio;
* rotación;
* separación por ambiente;
* acceso auditado;
* no compartir secrets en chats o prompts IA;
* no incluir secrets en imágenes Docker.

---

## 20. Migraciones

Las migraciones de base de datos seguirán `ADR-003`.

Flujo obligatorio para producción:

```text id="e9p8gq"
1. Crear migración en local.
2. Revisar SQL generado.
3. Ejecutar tests.
4. Aplicar en dev.
5. Aplicar en staging.
6. Validar staging.
7. Crear backup de producción.
8. Aplicar migración en producción.
9. Validar producción.
10. Registrar evidencia.
```

Regla:

```text id="8v1m06"
Ninguna migración crítica financiera debe ejecutarse sin backup previo.
```

---

## 21. CI/CD

### 21.1. Herramienta inicial

Se recomienda GitHub Actions.

Pipeline inicial:

```text id="tq6f37"
install
lint
typecheck
unit tests
integration tests
build
docker build
security checks
push image
deploy to dev/staging
manual approval for production
```

### 21.2. Producción

El despliegue a producción debe requerir:

* rama protegida;
* aprobación manual;
* tests exitosos;
* build reproducible;
* backup si hay migración;
* registro de release;
* posibilidad de rollback.

---

## 22. Estrategia de releases

### 22.1. MVP

Estrategia simple:

```text id="4mg8gs"
rolling update o restart controlado
```

### 22.2. Producción con más tenants

Recomendado:

```text id="q6h5ul"
blue/green deployment
canary deployment
feature flags
```

### 22.3. Feature flags

Los feature flags podrán usarse para:

* activar módulos por tenant;
* liberar funcionalidades gradualmente;
* probar módulos nuevos;
* desactivar funciones problemáticas;
* controlar planes comerciales.

---

## 23. Rollback

Debe existir plan de rollback para:

* aplicación;
* migraciones;
* configuración;
* Keycloak;
* reverse proxy;
* variables de entorno.

Rollback de aplicación:

```text id="cjxspz"
volver a imagen Docker anterior
```

Rollback de base de datos:

```text id="ljhqhi"
restaurar backup o ejecutar migración compensatoria
```

Regla:

```text id="qvbcwz"
El rollback de datos financieros debe diseñarse con extrema cautela.
```

---

## 24. Backups

### 24.1. Base de datos principal

Obligatorio:

* backup automático diario;
* backup previo a migraciones críticas;
* prueba de restauración;
* retención definida;
* acceso restringido.

### 24.2. Storage

Obligatorio:

* backup o versionamiento de archivos sensibles;
* protección contra eliminación accidental;
* separación por tenant;
* restauración probada.

### 24.3. Keycloak

Obligatorio cuando se incorpore:

* backup de base de datos Keycloak;
* export de configuración de realm;
* respaldo de clients críticos;
* documentación de recuperación.

### 24.4. Configuración

Debe respaldarse:

* variables no sensibles documentadas;
* configuración de gateway;
* scripts;
* infraestructura como código;
* configuración de CI/CD;
* documentación de despliegue.

---

## 25. RPO y RTO

Valores iniciales del MVP:

| Métrica                           | Valor inicial |
| --------------------------------- | ------------: |
| RPO                               |      24 horas |
| RTO                               |       8 horas |
| Backup DB                         |        Diario |
| Prueba de restore                 |    Trimestral |
| Backup antes de migración crítica |   Obligatorio |

Estos valores deberán revisarse cuando existan tenants reales y acuerdos de servicio.

---

## 26. Observabilidad

El despliegue debe incluir observabilidad progresiva.

### 26.1. MVP

* logs estructurados;
* request ID;
* health checks;
* errores de aplicación;
* métricas básicas del proceso;
* logs de reverse proxy;
* logs de base de datos básicos.

### 26.2. Fase posterior

* métricas Prometheus;
* dashboards Grafana;
* tracing distribuido;
* alertas;
* monitoreo de jobs;
* monitoreo de colas;
* monitoreo de PostgreSQL;
* monitoreo de Keycloak;
* monitoreo de storage;
* error tracking.

---

## 27. Health checks

Endpoints sugeridos:

```text id="jlg5v2"
GET /api/v1/health
GET /api/v1/health/details
```

Health básico:

* API responde.

Health detallado:

* PostgreSQL;
* Redis;
* storage;
* Keycloak;
* worker;
* colas.

El health detallado no debe exponerse públicamente sin protección.

---

## 28. Logs

Reglas:

* logs estructurados;
* incluir traceId;
* incluir tenantId cuando aplique;
* no incluir tokens;
* no incluir contraseñas;
* no incluir comprobantes;
* no incluir cédulas completas;
* no incluir datos bancarios completos;
* configurar retención;
* centralizar logs en fase posterior.

Campos sugeridos:

```text id="om64mw"
timestamp
level
service
environment
traceId
tenantId
userId
method
path
status
latencyMs
message
errorCode
```

---

## 29. Seguridad de red

Producción debe cumplir:

* PostgreSQL no expuesto públicamente.
* Redis no expuesto públicamente.
* Keycloak admin protegido.
* Storage privado.
* API detrás de reverse proxy.
* HTTPS obligatorio.
* puertos mínimos abiertos.
* firewall o security groups.
* acceso SSH restringido.
* credenciales por ambiente.
* backups protegidos.

---

## 30. Hardening de contenedores

Reglas:

* no correr como root cuando sea viable;
* imágenes mínimas;
* dependencias auditadas;
* no incluir secretos;
* no incluir `.env`;
* no incluir archivos innecesarios;
* limitar permisos;
* actualizar imágenes base;
* escanear vulnerabilidades;
* usar health checks;
* separar build/runtime.

---

## 31. Infraestructura como código

### 31.1. MVP

Versionar:

```text id="14sfq6"
docker-compose.yml
Dockerfile
reverse proxy config
scripts de despliegue
.env.example
```

### 31.2. Fase cloud

Evaluar:

```text id="31oarm"
Terraform
OpenTofu
Pulumi
AWS CDK
Ansible
```

La herramienta final dependerá del proveedor elegido.

Regla:

```text id="7bjoga"
La infraestructura crítica debe ser reproducible y documentada.
```

---

## 32. Estrategia AWS futura

AWS no será obligatorio desde el primer día, pero será una ruta recomendada si RESIDENT requiere escala, servicios administrados y madurez operativa.

### 32.1. Servicios candidatos

```text id="v9j910"
Amazon ECS / Fargate       → contenedores
Amazon RDS for PostgreSQL  → base de datos administrada
Amazon ElastiCache Redis   → cache/colas
Amazon S3                  → storage
AWS Secrets Manager        → secretos
Amazon CloudWatch          → logs/métricas
Application Load Balancer  → entrada HTTP/HTTPS
Amazon ECR                 → registry de imágenes
```

Amazon ECS es un servicio administrado para desplegar, administrar y escalar aplicaciones contenerizadas, por lo que encaja como ruta futura para RESIDENT si el proyecto decide usar AWS sin asumir desde el inicio la complejidad de Kubernetes.

---

## 33. Estrategia Kubernetes futura

Kubernetes no se adoptará en el MVP.

Podrá evaluarse si:

* existen múltiples microservicios;
* se requiere alta disponibilidad compleja;
* se requiere autoscaling avanzado;
* existe equipo con experiencia DevOps;
* se justifica el costo operativo;
* el negocio requiere portabilidad avanzada.

Opciones:

```text id="d71k7f"
AWS EKS
Google GKE
Azure AKS
DigitalOcean Kubernetes
Kubernetes autogestionado
```

Decisión:

```text id="voe1bg"
No usar Kubernetes antes de tener necesidad real y capacidad operativa.
```

---

## 34. Estrategia PaaS alternativa

Antes de AWS complejo, se puede usar PaaS.

Opciones:

```text id="966anq"
Render
Railway
Fly.io
DigitalOcean App Platform
Northflank
Heroku-like platforms
```

Ventajas:

* menor DevOps;
* despliegue rápido;
* SSL simple;
* logs integrados;
* integración Git;
* bajo costo inicial según plan.

Desventajas:

* límites por plan;
* menor control;
* costos pueden crecer;
* dependencia de proveedor;
* Keycloak puede ser más complejo según plataforma.

---

## 35. Estrategia VPS económica

Una opción inicial viable:

```text id="l65p57"
VPS + Docker Compose + reverse proxy + backups automatizados
```

Ventajas:

* bajo costo;
* control;
* simple para MVP;
* compatible con Docker;
* fácil de entender.

Desventajas:

* más responsabilidad operativa;
* backups manuales o scripts;
* seguridad del servidor;
* actualizaciones;
* monitoreo;
* recuperación ante fallos;
* alta disponibilidad limitada.

Regla:

```text id="vru1b3"
VPS es aceptable para MVP controlado, no para operación crítica sin controles.
```

---

## 36. Estrategia recomendada por fases

### 36.1. Fase A — Desarrollo local

```text id="7mazcp"
Docker Compose
resident-api
postgres
redis
minio
mailhog
keycloak opcional
```

### 36.2. Fase B — Dev/Staging

```text id="ngucma"
PaaS o VPS con Docker
base de datos separada
reverse proxy
dominios dev/staging
CI/CD
```

### 36.3. Fase C — Producción inicial

```text id="e5tw29"
VPS robusto o PaaS
PostgreSQL protegido
backups automáticos
reverse proxy
HTTPS
storage privado
monitoring básico
```

### 36.4. Fase D — Producción con Keycloak

```text id="9y59f7"
Keycloak productivo
Keycloak DB
realm resident
clients configurados
MFA para administradores
backups Keycloak
```

### 36.5. Fase E — Producción administrada

```text id="9rv94g"
PostgreSQL administrado
storage administrado
secrets manager
logs centralizados
registry de imágenes
```

### 36.6. Fase F — Microservicios

```text id="lgzpi4"
API Gateway formal
servicios separados
orquestador de contenedores
observabilidad distribuida
service-to-service auth
```

---

## 37. Criterios para migrar a servicios administrados

Migrar PostgreSQL a servicio administrado cuando:

* existan tenants reales;
* los backups sean críticos;
* el volumen de pagos crezca;
* se requiera restauración confiable;
* no se quiera administrar DB manualmente;
* staging/production necesiten paridad;
* el costo se justifique.

Migrar a orquestador de contenedores cuando:

* existan varios servicios;
* se necesite escalamiento independiente;
* se requieran despliegues avanzados;
* el equipo pueda operar la plataforma;
* el costo operativo esté justificado.

---

## 38. Criterios para no escalar prematuramente

No migrar a ECS/EKS/Kubernetes solo porque el sistema “eventualmente será microservicios”.

Se debe tener evidencia:

* carga real;
* varios tenants activos;
* necesidad de escalamiento independiente;
* límites claros de dominio;
* capacidad operativa;
* presupuesto;
* observabilidad mínima;
* CI/CD maduro;
* backups probados.

---

## 39. Integración con WordPress

El portal actual WordPress permanecerá separado.

Reglas:

* WordPress no se despliega dentro del Core.
* WordPress no comparte base de datos con Core.
* WordPress consume endpoints públicos controlados.
* WordPress redirige a login de Core/Keycloak.
* WordPress no almacena datos financieros.
* WordPress no almacena comprobantes.
* WordPress no administra tenants del Core, salvo integración futura controlada.

---

## 40. Integración con n8n

n8n puede desplegarse separado.

Opciones:

```text id="mx5zhx"
n8n local para pruebas
n8n self-hosted en VPS
n8n cloud
n8n como servicio separado en producción
```

Reglas:

* no compartir base de datos con Core;
* no acceder directo a PostgreSQL en producción;
* usar APIs;
* usar service account;
* limitar permisos;
* auditar acciones;
* proteger webhooks;
* controlar retención de ejecuciones.

---

## 41. Gestión de errores en despliegue

Errores críticos:

* migración fallida;
* contenedor no inicia;
* pérdida de conexión DB;
* Keycloak no disponible;
* Redis no disponible;
* storage no disponible;
* variables mal configuradas;
* CORS incorrecto;
* certificados expirados;
* reverse proxy mal enrutado.

Cada release debe tener checklist de validación.

---

## 42. Checklist de release

Antes de producción:

```text id="wpb1wj"
1. Tests unitarios pasan.
2. Tests integración pasan.
3. Build exitoso.
4. Docker image generada.
5. Variables revisadas.
6. Migraciones revisadas.
7. Backup creado si hay migración.
8. Staging validado.
9. Health checks OK.
10. Logs revisados.
11. CORS validado.
12. Login validado.
13. Keycloak validado, si aplica.
14. WordPress integration validada, si aplica.
15. n8n integration validada, si aplica.
16. Rollback plan definido.
17. Release registrado.
```

---

## 43. Checklist de producción mínima

Producción debe tener:

```text id="705x87"
HTTPS
reverse proxy
dominio configurado
base de datos protegida
backups automáticos
storage privado
variables seguras
logs
health checks
migraciones controladas
CI/CD o despliegue documentado
rollback
monitoreo básico
```

---

## 44. Impacto en SDD

Cada spec que implique despliegue o infraestructura debe documentar:

* variables requeridas;
* servicios externos;
* jobs;
* colas;
* storage;
* migraciones;
* health checks;
* permisos;
* secretos;
* impacto en CI/CD;
* impacto en rollback;
* impacto en backups.

---

## 45. Impacto en agentes IA

Los agentes IA deben respetar:

1. No proponer despliegue productivo sin HTTPS.
2. No exponer PostgreSQL públicamente.
3. No exponer Redis públicamente.
4. No versionar secretos.
5. No incluir `.env` real en commits.
6. No ejecutar migraciones críticas sin backup.
7. No crear Dockerfiles con secretos.
8. No omitir health checks.
9. No usar producción como entorno de prueba.
10. No proponer Kubernetes antes de justificarlo.
11. No exponer consola admin de Keycloak sin protección.
12. No guardar comprobantes en almacenamiento público.
13. No desactivar logs de errores.
14. No omitir rollback.
15. No mezclar WordPress y Core en la misma base de datos.

---

## 46. Consecuencias positivas

Esta decisión permite:

* bajo costo inicial;
* desarrollo local reproducible;
* despliegue gradual;
* evitar sobrearquitectura;
* preparar Keycloak correctamente;
* mantener opción de AWS futura;
* proteger producción mínima;
* facilitar CI/CD;
* soportar backups;
* preparar microservicios;
* mantener independencia del proveedor inicial;
* evolucionar según evidencia real.

---

## 47. Consecuencias negativas

Esta decisión implica:

* más fases de evolución;
* posible migración futura de VPS/PaaS a cloud administrado;
* necesidad de disciplina documental;
* necesidad de scripts y configuraciones reproducibles;
* operación manual inicial si se usa VPS;
* monitoreo inicial limitado;
* trabajo adicional cuando se incorpore Keycloak productivo;
* posible refactor de despliegue antes de microservicios.

---

## 48. Riesgos

| Riesgo                     | Impacto    | Mitigación                                   |
| -------------------------- | ---------- | -------------------------------------------- |
| Producción sin backups     | Crítico    | Backup obligatorio antes de producción       |
| PostgreSQL expuesto        | Crítico    | Red privada/firewall/security group          |
| Secretos en Git            | Crítico    | `.env.example`, secret scanning              |
| Keycloak mal configurado   | Alto       | Staging, hostname, reverse proxy, MFA admin  |
| Migración destructiva      | Crítico    | Staging, backup, revisión humana             |
| VPS sin mantenimiento      | Alto       | Hardening, actualizaciones, monitoreo        |
| Sin rollback               | Alto       | Versionado de imágenes y plan                |
| CORS incorrecto            | Medio-alto | Lista explícita por ambiente                 |
| Logs con datos sensibles   | Alto       | Sanitización y política de logs              |
| Kubernetes prematuro       | Medio-alto | Adoptar solo con justificación               |
| PaaS con límites ocultos   | Medio      | Evaluar costos y límites antes de producción |
| Storage público accidental | Alto       | Buckets privados y URLs firmadas             |

---

## 49. Criterios de aceptación

La implementación cumple este ADR si:

* Local usa Docker Compose o equivalente reproducible.
* Dev, staging y production están separados.
* Producción tiene HTTPS.
* Producción tiene reverse proxy.
* PostgreSQL no está expuesto públicamente.
* Redis no está expuesto públicamente.
* Existen backups.
* Existen variables por ambiente.
* Los secretos no están en Git.
* Hay pipeline CI/CD o proceso de despliegue documentado.
* Staging valida releases antes de producción.
* Las migraciones se ejecutan de forma controlada.
* Existe rollback.
* Keycloak tiene configuración productiva cuando se incorpore.
* Los archivos sensibles usan storage privado.
* Hay health checks.
* Hay logs mínimos.
* La estrategia futura hacia servicios administrados está documentada.

---

## 50. Decisión final

RESIDENT Core adoptará una estrategia de despliegue progresiva.

El desarrollo local usará Docker Compose para levantar el stack completo de forma reproducible.

La producción inicial podrá ejecutarse en VPS, PaaS o cloud simple con contenedores, siempre que cumpla mínimos de seguridad: HTTPS, reverse proxy, PostgreSQL protegido, backups, secrets seguros, storage privado, logs y health checks.

Keycloak se incorporará con configuración productiva antes de microservicios físicos.

Cuando el proyecto tenga tenants reales, mayor carga o requerimientos operativos más estrictos, se evaluará migrar progresivamente a servicios administrados como PostgreSQL administrado, storage administrado, secrets manager, registry de imágenes, logs centralizados y orquestación de contenedores.

AWS ECS/RDS/S3 o una alternativa equivalente serán rutas futuras posibles, pero no una obligación inicial.

La estrategia evita sobrearquitectura temprana sin comprometer seguridad, trazabilidad, recuperación y evolución hacia microservicios.
