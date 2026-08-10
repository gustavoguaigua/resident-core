# ADR-010 — Observability Strategy: Logs, Metrics, Traces, Health Checks and Operational Visibility

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                        |
| Documento       | ADR-010                                                                                                                                                              |
| Título          | Observability Strategy: Logs, Metrics, Traces, Health Checks and Operational Visibility                                                                              |
| Ruta            | `docs/decisions/ADR-010-observability-strategy.md`                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                  |
| Estado          | accepted                                                                                                                                                             |
| Fecha           | 2026-07-12                                                                                                                                                           |
| Relacionado con | `architecture.md`, `security.md`, `data-governance.md`, `ADR-008-api-gateway-strategy.md`, `ADR-009-deployment-strategy.md`, `ADR-006-identity-provider-strategy.md` |

---

## 2. Contexto

RESIDENT Core será un sistema transaccional multitenant para administrar conjuntos residenciales.

El sistema manejará:

* Datos personales.
* Datos financieros.
* Pagos.
* Cargos.
* Alícuotas.
* Estados de cuenta.
* Comprobantes.
* Reservas.
* Multas.
* Reuniones.
* Auditoría.
* Integraciones con WordPress.
* Automatizaciones con n8n.
* Autenticación con Keycloak como arquitectura objetivo.
* Futuros microservicios.

Por tanto, RESIDENT Core debe poder responder preguntas operativas como:

* ¿El sistema está funcionando?
* ¿Qué endpoint está fallando?
* ¿Qué tenant está afectado?
* ¿Qué usuario ejecutó una acción?
* ¿Qué job falló?
* ¿Qué pago tuvo error?
* ¿Qué migración produjo inconsistencia?
* ¿Keycloak está disponible?
* ¿PostgreSQL responde?
* ¿Redis responde?
* ¿El worker procesa colas?
* ¿Hay lentitud en reportes?
* ¿Existen intentos de acceso cross-tenant?
* ¿Qué ocurrió durante un incidente?

La observabilidad es esencial para operar el sistema de forma confiable, segura y trazable.

---

## 3. Problema

Se debe definir la estrategia de observabilidad para RESIDENT Core.

La decisión debe responder:

1. ¿Qué datos técnicos se deben recolectar?
2. ¿Cómo se manejarán logs?
3. ¿Cómo se manejarán métricas?
4. ¿Cómo se manejarán trazas?
5. ¿Cómo se correlacionarán requests, jobs y eventos?
6. ¿Cómo se monitoreará Keycloak?
7. ¿Cómo se monitoreará PostgreSQL?
8. ¿Cómo se monitoreará Redis?
9. ¿Cómo se monitorearán workers y colas?
10. ¿Qué alertas son necesarias?
11. ¿Qué datos no deben registrarse?
12. ¿Cómo preparar observabilidad para microservicios?

---

## 4. Decisión

RESIDENT Core adoptará una estrategia progresiva de observabilidad basada en:

```text id="3r7mxh"
Logs estructurados
+
Métricas
+
Trazas distribuidas
+
Health checks
+
Auditoría técnica
+
Alertas
+
Dashboards
```

La arquitectura objetivo usará OpenTelemetry como estándar vendor-neutral para instrumentación y correlación de señales de telemetría.

Prometheus será la opción preferente para recolectar métricas en fases posteriores, con Grafana como herramienta candidata para visualización.

Para el MVP se iniciará con logs estructurados, health checks, request ID, métricas básicas y dashboards simples.

---

## 5. Principios de observabilidad

### 5.1. Observabilidad desde el MVP

No se debe esperar a producción avanzada para agregar observabilidad.

Desde el MVP deben existir:

* logs estructurados;
* health checks;
* request ID;
* errores trazables;
* métricas mínimas;
* auditoría de operaciones críticas.

---

### 5.2. Correlación obligatoria

Cada request debe poder rastrearse mediante un identificador.

Regla:

```text id="p9vm6k"
Todo request debe tener traceId o requestId.
```

El identificador debe propagarse a:

* logs;
* errores;
* auditoría;
* jobs;
* eventos;
* llamadas a servicios externos;
* futuros microservicios.

---

### 5.3. Multitenancy visible, pero seguro

Los logs y métricas deben permitir identificar tenant afectado cuando aplique, sin exponer datos sensibles.

Permitido:

```text id="wicyb3"
tenantId
tenantSlug técnico
```

No permitido:

```text id="vd0i2a"
nombres completos de residentes sin necesidad
cédulas
comprobantes
saldos
datos bancarios
tokens
contraseñas
```

---

### 5.4. Auditoría funcional no es lo mismo que logging técnico

Los logs técnicos sirven para diagnóstico.

La auditoría funcional sirve para trazabilidad de negocio.

Ejemplo:

```text id="952zxu"
Log técnico:
POST /payments/123/confirm → 200 → 230ms

Auditoría funcional:
Usuario X confirmó pago Y del Tenant Z por motivo M.
```

Ambos son necesarios, pero no son lo mismo.

---

### 5.5. No registrar secretos ni datos sensibles

La observabilidad no debe convertirse en fuga de información.

Prohibido en logs:

* contraseñas;
* refresh tokens;
* access tokens completos;
* client secrets;
* API keys;
* comprobantes;
* documentos;
* cédulas completas;
* números bancarios completos;
* archivos;
* bodies completos de pagos;
* payloads sensibles de webhooks.

---

## 6. Señales de observabilidad

RESIDENT Core usará tres señales principales:

```text id="5s603b"
Logs
Metrics
Traces
```

OpenTelemetry define estas señales como parte de su modelo de observabilidad, junto con baggage para contexto distribuido.

---

## 7. Logs

### 7.1. Decisión

Todos los servicios deben emitir logs estructurados.

Formato preferente:

```text id="rbe8oe"
JSON estructurado
```

Ejemplo:

```json id="9xw2zf"
{
  "timestamp": "2026-07-12T15:30:00Z",
  "level": "info",
  "service": "resident-api",
  "environment": "staging",
  "traceId": "req_123456",
  "tenantId": "tenant_uuid",
  "userId": "user_uuid",
  "method": "POST",
  "path": "/api/v1/payments/123/confirm",
  "status": 200,
  "latencyMs": 230,
  "message": "Payment confirmed"
}
```

---

### 7.2. Niveles de log

Niveles permitidos:

```text id="3xlajd"
trace
debug
info
warn
error
fatal
```

Uso recomendado:

| Nivel | Uso                                  |
| ----- | ------------------------------------ |
| trace | Diagnóstico profundo temporal        |
| debug | Desarrollo y depuración controlada   |
| info  | Eventos normales relevantes          |
| warn  | Situaciones anómalas recuperables    |
| error | Fallos que requieren atención        |
| fatal | Fallo crítico del proceso o servicio |

---

### 7.3. Campos mínimos

Cada log relevante debe incluir:

```text id="pqryqk"
timestamp
level
service
environment
traceId
message
```

Cuando aplique:

```text id="5ajsnk"
tenantId
userId
method
path
status
latencyMs
resourceType
resourceId
jobId
eventType
errorCode
```

---

### 7.4. Logs de errores

Un error debe registrar:

* código de error;
* mensaje técnico controlado;
* stack trace solo en entornos autorizados;
* trace ID;
* servicio;
* endpoint;
* tenant si aplica;
* usuario si aplica;
* causa raíz si se conoce;
* correlación con job o evento si aplica.

No debe registrar:

* token;
* contraseña;
* body completo;
* comprobante;
* datos financieros detallados;
* datos personales innecesarios.

---

### 7.5. Logs de seguridad

Deben registrarse como mínimo:

* login exitoso;
* login fallido;
* refresh token fallido;
* intento de acceso sin token;
* intento de acceso cross-tenant;
* permiso insuficiente;
* cambio de rol;
* cambio de permiso;
* exportación de reporte sensible;
* descarga de documento sensible;
* fallo de validación de webhook;
* service account usada;
* error de firma de token;
* acceso a endpoint administrativo.

---

## 8. Métricas

### 8.1. Decisión

RESIDENT Core deberá emitir métricas técnicas y funcionales.

Prometheus será opción preferente para recolectar y consultar métricas en fases posteriores. Prometheus almacena métricas como series temporales identificadas por nombre y etiquetas, lo cual encaja bien con métricas por servicio, endpoint, tenant y estado.

---

### 8.2. Tipos de métricas

Tipos iniciales:

```text id="lc9x2p"
Counter
Gauge
Histogram
Summary
```

Prometheus define estos tipos de métricas en sus librerías de instrumentación.

---

### 8.3. Métricas HTTP

Métricas sugeridas:

```text id="6cndpf"
http_requests_total
http_request_duration_seconds
http_request_errors_total
http_requests_in_flight
http_response_size_bytes
```

Labels sugeridos:

```text id="z9xbnu"
service
environment
method
route
status_code
```

Evitar labels de alta cardinalidad como:

```text id="l7if7p"
userId
paymentId
receiptId
full path with UUID
email
cedula
```

---

### 8.4. Métricas de negocio

Métricas funcionales agregadas, sin datos sensibles:

```text id="sfa9lr"
payments_registered_total
payments_confirmed_total
payments_rejected_total
payments_reversed_total
fees_generated_total
charges_created_total
reservations_created_total
reservations_approved_total
fines_created_total
account_statements_generated_total
```

Labels permitidos:

```text id="1w95e5"
environment
tenantId opcional con control de cardinalidad
status
module
```

Regla:

```text id="c1vx1e"
No exponer montos financieros detallados como métricas sin análisis de privacidad y cardinalidad.
```

---

### 8.5. Métricas de jobs

Para workers y colas:

```text id="tj14ok"
jobs_processed_total
jobs_failed_total
jobs_retried_total
jobs_duration_seconds
jobs_queue_depth
jobs_delayed_total
jobs_dead_letter_total
```

Labels:

```text id="2j482j"
jobType
status
environment
```

---

### 8.6. Métricas de base de datos

Métricas recomendadas:

* conexiones activas;
* conexiones disponibles;
* queries lentas;
* tiempo promedio de query;
* errores de conexión;
* locks;
* tamaño de base;
* tamaño de tablas críticas;
* tamaño de índices;
* crecimiento de auditoría;
* duración de migraciones;
* fallos de migración.

---

### 8.7. Métricas de Redis

Métricas recomendadas:

* memoria usada;
* conexiones;
* comandos por segundo;
* cache hits;
* cache misses;
* errores;
* latencia;
* tamaño de colas;
* jobs pendientes;
* jobs fallidos.

---

### 8.8. Métricas de Keycloak

Cuando se incorpore Keycloak, deben habilitarse y recolectarse métricas. Keycloak tiene soporte incorporado para métricas, habilitable con la opción `metrics-enabled`, y además provee guías para visualizar métricas en Grafana.

Métricas importantes:

* logins exitosos;
* logins fallidos;
* errores de token;
* sesiones activas;
* latencia;
* errores HTTP;
* disponibilidad;
* uso de JVM;
* base de datos Keycloak;
* eventos de admin;
* intentos fallidos por client;
* errores de federación futura.

---

## 9. Trazas

### 9.1. Decisión

OpenTelemetry será la estrategia objetivo para trazas distribuidas.

En el MVP, se puede iniciar con request ID y logs correlacionados.

En fase posterior, se instrumentará:

* API;
* calls a DB;
* calls a Redis;
* calls a Keycloak;
* jobs;
* eventos;
* integraciones externas;
* n8n;
* microservicios futuros.

---

### 9.2. Propagación

Headers sugeridos:

```text id="108f8m"
traceparent
tracestate
X-Request-Id
X-Correlation-Id
```

Reglas:

* aceptar `traceparent` si viene de un cliente confiable;
* generar trace si no existe;
* propagar a servicios internos;
* propagar a jobs;
* propagar a eventos;
* incluir en logs y auditoría cuando aplique.

---

### 9.3. Spans sugeridos

Spans recomendados:

```text id="fbqhsf"
HTTP request
Controller
Use case
Database query
Transaction
Redis operation
External API call
File storage operation
Job execution
Domain event handling
Keycloak token validation
Webhook processing
```

---

### 9.4. Trazas en microservicios futuros

Cuando existan microservicios, las trazas distribuidas serán obligatorias para:

* payments-service;
* reports-service;
* notifications-service;
* files-service;
* resident-core-api;
* API Gateway;
* Keycloak;
* workers.

Objetivo:

```text id="wfkhyu"
Seguir una operación desde el request inicial hasta todos los servicios involucrados.
```

---

## 10. Health checks

### 10.1. Endpoints

Contrato autoritativo de RESIDENT Core:

```text id="5v0gyz"
GET /api/v1/health          → liveness mínima, pública y sin autenticación
GET /api/v1/health/details  → readiness detallada, protegida y platform-scoped
```

No se adoptan inicialmente rutas alternativas `/live`, `/ready` o `/status`.

### 10.2. Health básico

`GET /api/v1/health` solo indica que el proceso HTTP está vivo. No consulta PostgreSQL,
Redis, storage, Keycloak, colas ni migraciones. No requiere Bearer token ni contexto de
tenant y puede ser utilizado por el balanceador u orquestador.

Respuesta `200 OK`:

```json id="smjpio"
{
  "status": "ok",
  "service": "resident-api",
  "timestamp": "2026-08-10T15:30:00Z"
}
```

La respuesta no puede incluir dependencias, versión, build, hostname, configuración,
tenant, usuario, secretos ni detalles de errores.

---

### 10.3. Readiness detallada

`GET /api/v1/health/details` indica si la API puede recibir tráfico y valida, cuando
formen parte del despliegue:

* PostgreSQL;
* Redis;
* storage;
* Keycloak;
* worker y colas;
* migraciones críticas;
* versión y build de la aplicación.

Respuesta de ejemplo:

```json id="w70ap9"
{
  "status": "degraded",
  "service": "resident-api",
  "version": "0.1.0",
  "build": "git-sha",
  "checks": {
    "postgres": { "status": "ok" },
    "redis": { "status": "ok" },
    "storage": { "status": "ok" },
    "keycloak": { "status": "unavailable" }
  },
  "timestamp": "2026-08-10T15:30:00Z"
}
```

El estado superior es `ok` cuando todas las dependencias requeridas están disponibles y
`degraded` cuando alguna falla. Cada check usa `ok`, `unavailable` o `notConfigured`.
Checks de componentes no desplegados pueden omitirse; si se incluyen deben usar
`notConfigured` y no degradan el servicio.

Mapeo HTTP obligatorio:

```text id="health-status-code-mapping"
200 OK                  → status = ok
503 Service Unavailable → status = degraded
```

Un fallo conocido de dependencia devuelve el payload health plano con `503`. Fallos no
controlados se procesan mediante el error envelope estándar.

---

### 10.4. Excepción al response envelope

Los dos endpoints health devuelven payloads planos y no usan el envelope de éxito
`{"data": ...}`. Esta excepción existe para interoperar con probes, balanceadores y
plataformas de monitoreo y debe declararse en OpenAPI con:

```text id="health-openapi-extensions"
x-response-envelope: false
x-health-endpoint: true
```

Además, la exposición se declara por operación:

```yaml id="health-openapi-exposure"
/api/v1/health:
  x-auth-required: false
  x-platform-scope: false
  x-tenant-scope: false
  x-public-exposure: true

/api/v1/health/details:
  x-auth-required: true
  x-platform-scope: true
  x-tenant-scope: false
  x-public-exposure: false
```

La excepción cubre únicamente las respuestas health `200` y `503`. Respuestas `401`,
`403`, `404`, `429` y errores no controlados conservan el error envelope estándar.

---

### 10.5. Seguridad de health detailed

El health detallado no se expone públicamente. En ambientes no locales exige ambas
capas:

* exposición restringida a red interna, plataforma de monitoreo o API Gateway;
* Bearer token de service account o administrador técnico con permiso
  `platform.health.read`.

No devuelve URLs internas, hosts, puertos, credenciales, query text, stack traces,
mensajes crudos de proveedores, datos de tenant o usuario ni secretos. En desarrollo
local puede habilitarse desde localhost, sin ampliar la exposición de otros ambientes.

---

### 10.6. Keycloak health checks

Cuando Keycloak sea parte del despliegue, se deben activar y monitorear sus health checks. La documentación oficial indica que Keycloak expone health checks en el puerto de administración `9000` por defecto.

---

## 11. Readiness y liveness

### 11.1. Liveness

Indica si el proceso está vivo.

Ejemplo:

```text id="flnzpr"
El contenedor responde.
```

### 11.2. Readiness

Indica si el servicio puede recibir tráfico.

Debe validar:

* conexión a DB;
* migraciones críticas;
* dependencias mínimas;
* configuración válida.

Regla:

```text id="gcgkrh"
Un servicio vivo no necesariamente está listo.
```

---

## 12. Alertas

### 12.1. Decisión

Deben existir alertas progresivas según madurez del despliegue.

En MVP:

* alertas básicas manuales o del proveedor;
* errores críticos;
* caída de API;
* caída de base de datos;
* fallo de backup.

En producción real:

* alertas automáticas.

---

### 12.2. Alertas críticas iniciales

```text id="cxi3ng"
API down
PostgreSQL down
Redis down
Keycloak down
Backup failed
High error rate
High response time
Disk almost full
Queue stuck
Payment confirmation failures
Cross-tenant access attempt
Webhook signature failures
Failed login spike
Storage unavailable
```

---

### 12.3. Alertas financieras

Alertas relacionadas con integridad financiera:

* pago confirmado falla;
* reverso falla;
* conciliación falla;
* generación de alícuotas falla;
* job financiero queda pendiente;
* diferencia entre saldo materializado y saldo calculado;
* duplicidad detectada;
* importación bancaria con errores;
* exportación financiera fallida.

---

### 12.4. Canales de alerta

Canales posibles:

```text id="fhpclo"
email
Slack
Telegram
n8n
SMS futuro
PagerDuty/Opsgenie futuro
```

n8n puede orquestar alertas, pero no debe ser la única fuente de monitoreo crítico.

---

## 13. Dashboards

### 13.1. Dashboard MVP

Debe incluir:

* estado API;
* requests por minuto;
* errores por endpoint;
* latencia promedio;
* latencia p95;
* estado PostgreSQL;
* estado Redis;
* jobs pendientes;
* jobs fallidos;
* uso CPU/memoria;
* almacenamiento;
* backups.

---

### 13.2. Dashboard de negocio-operación

Debe incluir métricas agregadas:

* pagos registrados;
* pagos pendientes de revisión;
* pagos confirmados;
* pagos rechazados;
* generación de alícuotas;
* reservas creadas;
* reservas aprobadas;
* reportes generados;
* exportaciones sensibles;
* notificaciones enviadas.

---

### 13.3. Dashboard Keycloak

Debe incluir:

* disponibilidad;
* logins exitosos;
* logins fallidos;
* errores por client;
* sesiones activas;
* latencia;
* errores HTTP;
* eventos admin;
* estado base Keycloak.

---

## 14. Auditoría técnica

La auditoría técnica debe registrar eventos operativos importantes.

Ejemplos:

* despliegue realizado;
* migración ejecutada;
* backup ejecutado;
* restore probado;
* configuración cambiada;
* variable crítica cambiada;
* client Keycloak cambiado;
* gateway actualizado;
* service account creada;
* secret rotado;
* job crítico ejecutado.

Esto es distinto de auditoría funcional de negocio, pero puede almacenarse en el mismo sistema de auditoría o en un registro técnico separado.

---

## 15. Auditoría funcional y observabilidad

La auditoría funcional debe integrarse con observabilidad mediante `traceId`.

Ejemplo:

```text id="6r29ek"
traceId: req_123456

Log:
POST /payments/abc/confirm status=200 latency=230ms

Audit:
user=U1 tenant=T1 action=payments.confirm resource=payment:abc result=success
```

Esto permite reconstruir eventos técnicos y funcionales.

---

## 16. Observabilidad de WordPress

WordPress no es parte del Core transaccional, pero debe considerarse en integraciones.

Observar:

* disponibilidad del portal;
* errores al consumir endpoints públicos;
* latencia de endpoints públicos;
* fallos de integración;
* enlaces de acceso residentes;
* cambios de configuración de tenant en WordPress.

WordPress no debe registrar ni almacenar datos financieros sensibles del Core.

---

## 17. Observabilidad de n8n

n8n debe monitorearse si participa en procesos relevantes.

Métricas y eventos:

* workflows fallidos;
* workflows demorados;
* webhooks recibidos;
* llamadas al Core fallidas;
* reintentos;
* credenciales expiradas;
* errores de autenticación;
* acciones críticas ejecutadas;
* historial de ejecuciones.

Reglas:

* limitar datos sensibles en ejecuciones;
* auditar acciones críticas en RESIDENT Core;
* no depender únicamente del historial de n8n como auditoría.

---

## 18. Observabilidad de archivos y storage

Monitorear:

* carga de archivos;
* descarga de archivos;
* errores de storage;
* tiempo de subida;
* tiempo de descarga;
* tamaño de archivos;
* fallos de URL firmada;
* accesos a documentos sensibles;
* almacenamiento por tenant;
* eliminación lógica;
* restore de archivos.

Prohibido:

* registrar contenido de archivos;
* registrar comprobantes completos;
* exponer URLs internas en logs públicos.

---

## 19. Observabilidad de seguridad

Eventos prioritarios:

* intentos de login fallidos;
* aumento anormal de login failures;
* tokens inválidos;
* firmas JWT inválidas;
* intentos cross-tenant;
* acceso a endpoint admin;
* rate limiting activado;
* webhooks inválidos;
* cambios de roles;
* descarga masiva de documentos;
* exportación masiva;
* errores de CORS;
* service account usada fuera de patrón esperado.

---

## 20. Observabilidad financiera

Eventos prioritarios:

* generación de alícuotas;
* creación de cargos;
* confirmación de pagos;
* rechazo de pagos;
* reversos;
* ajustes;
* conciliaciones;
* importaciones bancarias;
* reportes financieros;
* exportaciones financieras;
* recalculo de saldos;
* inconsistencias de saldo;
* pagos duplicados detectados.

Regla:

```text id="r53h02"
La observabilidad financiera debe ayudar a detectar errores sin exponer datos financieros sensibles.
```

---

## 21. Retención de logs y métricas

Política inicial sugerida:

| Tipo                     |       Retención inicial |
| ------------------------ | ----------------------: |
| Logs técnicos dev        |             7 a 15 días |
| Logs técnicos staging    |            15 a 30 días |
| Logs técnicos producción |            30 a 90 días |
| Logs de seguridad        |           90 a 180 días |
| Auditoría funcional      | Conservación prolongada |
| Métricas operativas      |            30 a 90 días |
| Trazas                   |             7 a 30 días |
| Dashboards agregados     |         Según necesidad |
| Logs de n8n              | Reducidos y minimizados |

Los tiempos definitivos deberán ajustarse según política legal, contractual y de costos.

---

## 22. Sanitización

Antes de registrar información, aplicar sanitización.

Campos a ocultar:

```text id="gk0nlw"
password
accessToken
refreshToken
authorization
cookie
clientSecret
apiKey
receiptFile
bankAccountNumber
identificationNumber
creditCard
```

Ejemplo:

```json id="89lrxl"
{
  "authorization": "[REDACTED]",
  "password": "[REDACTED]"
}
```

---

## 23. Cardinalidad de métricas

Evitar labels de alta cardinalidad.

No usar como labels:

* userId;
* email;
* cédula;
* paymentId;
* chargeId;
* receiptId;
* full URL con UUID;
* IP completa como label principal;
* nombres de residentes.

Permitido con control:

* tenantId;
* route;
* method;
* status;
* service;
* environment;
* jobType.

Regla:

```text id="zbap8x"
Las métricas sirven para tendencias agregadas, no para auditoría detallada por persona.
```

---

## 24. Error tracking

En fase posterior se puede incorporar una herramienta de error tracking.

Opciones:

```text id="ll5sut"
Sentry
Bugsnag
GlitchTip
OpenObserve
Grafana stack
Proveedor equivalente
```

Reglas:

* sanitizar payloads;
* no enviar datos personales sensibles;
* no enviar comprobantes;
* no enviar tokens;
* configurar entorno;
* incluir release version;
* incluir traceId.

---

## 25. Herramientas candidatas

### 25.1. MVP

```text id="5q9ed1"
NestJS logger estructurado
Pino o Winston
Health checks propios
Logs del proveedor
Docker logs
PostgreSQL logs básicos
Reverse proxy logs
```

### 25.2. Fase intermedia

```text id="fz5fjq"
OpenTelemetry SDK
OpenTelemetry Collector
Prometheus
Grafana
Loki
Tempo
Sentry/GlitchTip
```

### 25.3. Fase cloud

```text id="ze9u00"
CloudWatch
AWS X-Ray
Managed Prometheus
Grafana Cloud
Datadog
New Relic
Elastic Observability
OpenSearch
```

La herramienta final debe elegirse según costo, hosting, experiencia operativa y nivel de madurez.

---

## 26. OpenTelemetry

### 26.1. Decisión objetivo

OpenTelemetry será el estándar objetivo de instrumentación.

Razones:

* vendor-neutral;
* soporta trazas, métricas y logs;
* permite cambiar backend de observabilidad;
* prepara microservicios;
* facilita correlación;
* evita lock-in temprano.

OpenTelemetry se define oficialmente como un framework open source y vendor-neutral para instrumentar, generar, recolectar y exportar datos de telemetría como traces, metrics y logs.

---

### 26.2. Implementación progresiva

Fase MVP:

```text id="2qgzwr"
requestId
logs estructurados
health checks
métricas básicas
```

Fase intermedia:

```text id="ei91l1"
OpenTelemetry SDK
instrumentación HTTP
instrumentación DB
instrumentación Redis
instrumentación jobs
```

Fase microservicios:

```text id="eebgu0"
tracing distribuido completo
OpenTelemetry Collector
exporters a backend elegido
```

---

## 27. Prometheus y Grafana

### 27.1. Prometheus

Prometheus será opción preferente para métricas cuando exista infraestructura suficiente.

Usos:

* scraping de métricas;
* alert rules;
* consultas PromQL;
* métricas de API;
* métricas de PostgreSQL;
* métricas de Redis;
* métricas de Keycloak;
* métricas de workers.

Prometheus usa un modelo dimensional con métricas y etiquetas, y PromQL permite consultar y correlacionar series temporales para visualización y alertas.

---

### 27.2. Grafana

Grafana será opción preferente para dashboards.

Dashboards sugeridos:

* API overview;
* PostgreSQL;
* Redis;
* Keycloak;
* Jobs;
* Financial operations;
* Security events;
* Tenant activity;
* Gateway;
* Storage.

---

## 28. Monitoreo de PostgreSQL

Monitorear:

* disponibilidad;
* conexiones;
* locks;
* queries lentas;
* deadlocks;
* uso de CPU;
* uso de memoria;
* tamaño de DB;
* crecimiento por tabla;
* errores;
* duración de backups;
* fallos de backup;
* replicación futura;
* restauraciones de prueba.

Alertas:

* DB no disponible;
* conexiones agotadas;
* disk > 80%;
* backup fallido;
* query lenta recurrente;
* locks prolongados;
* migración fallida.

---

## 29. Monitoreo de Redis

Monitorear:

* disponibilidad;
* memoria;
* conexiones;
* latencia;
* evictions;
* errores;
* tamaño de colas;
* jobs pendientes;
* jobs fallidos;
* dead letter queue;
* reintentos.

Alertas:

* Redis down;
* memoria alta;
* cola estancada;
* jobs fallidos recurrentes;
* latencia alta.

---

## 30. Monitoreo de workers y colas

Monitorear:

* worker vivo;
* jobs procesados;
* jobs fallidos;
* jobs pendientes;
* jobs retrasados;
* duración de jobs;
* retries;
* errores por tipo;
* jobs financieros críticos;
* jobs de notificación.

Alertas:

* worker down;
* cola sin procesar;
* job financiero fallido;
* generación de alícuotas fallida;
* conciliación fallida;
* exportación fallida.

---

## 31. Monitoreo de Keycloak

Monitorear:

* health;
* readiness;
* login failures;
* token failures;
* client errors;
* sesiones;
* latencia;
* disponibilidad;
* DB Keycloak;
* errores admin;
* cambios de realm;
* cambios de client;
* cambios de roles;
* errores de redirect URI.

Keycloak provee health checks y métricas integradas, que deben ser habilitadas y recolectadas en entornos productivos.

---

## 32. Monitoreo del API Gateway / reverse proxy

Monitorear:

* requests;
* latencia;
* errores 4xx;
* errores 5xx;
* upstream timeouts;
* rate limits;
* payload too large;
* TLS errors;
* CORS errors;
* rutas no encontradas;
* IPs bloqueadas;
* webhooks rechazados.

---

## 33. Monitoreo de frontend futuro

Cuando exista frontend Core:

* errores JS;
* tiempos de carga;
* errores de API;
* token expiration UX;
* navegación;
* pantallas lentas;
* login failures;
* cambio de tenant;
* errores de autorización.

No registrar datos financieros sensibles en herramientas de frontend monitoring.

---

## 34. Monitoreo de WordPress

Para el portal actual:

* disponibilidad;
* tiempos de respuesta;
* errores 5xx;
* errores al llamar endpoints públicos;
* enlaces rotos hacia Core;
* fallos de certificado;
* fallos de DNS;
* plugins críticos;
* actualizaciones.

WordPress no debe integrarse al sistema de logs sensibles del Core.

---

## 35. Incident response

Observabilidad debe soportar incidentes.

Cada incidente debe poder responder:

```text id="e6mybu"
¿Qué ocurrió?
¿Cuándo ocurrió?
¿Qué tenant fue afectado?
¿Qué usuario estuvo involucrado?
¿Qué endpoint falló?
¿Qué job falló?
¿Qué datos pudieron afectarse?
¿Qué servicio causó el fallo?
¿Qué evidencia existe?
¿Qué acción correctiva se tomó?
```

---

## 36. Severidad de incidentes

Niveles sugeridos:

```text id="wtmp82"
SEV-1 Crítico
SEV-2 Alto
SEV-3 Medio
SEV-4 Bajo
```

### 36.1. SEV-1

Ejemplos:

* caída total de producción;
* fuga cross-tenant;
* pérdida de datos financieros;
* Keycloak indisponible para todos;
* PostgreSQL caído;
* backup restaurable inexistente;
* exposición de comprobantes.

### 36.2. SEV-2

Ejemplos:

* pagos no se confirman;
* reportes financieros fallan;
* jobs financieros fallan;
* login falla para un grupo;
* lentitud severa.

### 36.3. SEV-3

Ejemplos:

* endpoint no crítico falla;
* notificaciones retrasadas;
* reporte secundario fallido.

### 36.4. SEV-4

Ejemplos:

* error visual;
* warning no crítico;
* métrica anómala sin impacto.

---

## 37. Runbooks

Deben existir runbooks para:

* API down;
* PostgreSQL down;
* Redis down;
* Keycloak down;
* backup failed;
* migración fallida;
* cola estancada;
* job financiero fallido;
* storage unavailable;
* alto error rate;
* incidente cross-tenant;
* sospecha de token comprometido;
* certificados expirados.

---

## 38. Relación con auditoría legal y funcional

Los logs técnicos no reemplazan la auditoría funcional.

La auditoría funcional debe conservarse según política de retención prolongada.

Ejemplos de auditoría funcional:

* usuario confirmó pago;
* usuario reversó pago;
* usuario exportó reporte;
* usuario cambió rol;
* usuario descargó comprobante;
* usuario cambió configuración financiera.

---

## 39. Relación con data governance

Observabilidad debe cumplir `data-governance.md`.

Reglas:

* minimización;
* retención definida;
* sanitización;
* acceso restringido;
* no datos sensibles innecesarios;
* separación por ambiente;
* protección de logs;
* eliminación o archivo según política.

---

## 40. Acceso a observabilidad

Acceso permitido según rol:

```text id="l9fs5e"
PlatformAdmin
PlatformOperator
PlatformAuditor
SecurityOperator futuro
DevOps futuro
```

No deben acceder libremente:

* residentes;
* usuarios tenant ordinarios;
* guardias;
* usuarios externos;
* n8n sin justificación.

Algunos reportes operativos por tenant pueden exponerse en el panel administrativo, pero no logs crudos.

---

## 41. Seguridad de herramientas de observabilidad

Las herramientas de observabilidad deben protegerse.

Reglas:

* autenticación obligatoria;
* MFA para administradores;
* no exposición pública sin control;
* acceso por rol;
* logs de acceso;
* secrets protegidos;
* dashboards sin datos sensibles;
* backups de configuración;
* no usar credenciales compartidas;
* eliminar usuarios al salir del equipo.

---

## 42. Ambientes

### 42.1. Local

* logs en consola;
* debug permitido;
* datos ficticios;
* OpenTelemetry opcional;
* Prometheus/Grafana opcional.

### 42.2. Dev

* logs estructurados;
* health checks;
* métricas básicas;
* errores visibles;
* datos ficticios.

### 42.3. Staging

* logs estructurados;
* métricas;
* health checks;
* alertas básicas;
* Keycloak observability;
* pruebas de incidentes;
* pruebas de dashboards.

### 42.4. Production

* logs estructurados;
* métricas;
* health checks;
* alertas;
* dashboards;
* retención definida;
* acceso restringido;
* sanitización obligatoria;
* runbooks;
* pruebas de restauración y monitoreo.

---

## 43. Implementación en NestJS

Componentes sugeridos:

```text id="7adnc4"
LoggerModule
RequestContextMiddleware
TraceIdInterceptor
LoggingInterceptor
ErrorFilter
MetricsModule
HealthModule
AuditModule
```

### 43.1. Middleware de contexto

Debe capturar:

* traceId;
* requestId;
* userId;
* tenantId;
* IP;
* user agent;
* endpoint.

### 43.2. Interceptor de logging

Debe registrar:

* inicio/final de request;
* duración;
* estado;
* error code;
* traceId.

### 43.3. Filtro de errores

Debe:

* normalizar errores;
* ocultar detalles internos;
* registrar error técnico;
* devolver traceId;
* evitar exposición de stack en producción.

---

## 44. Instrumentación de Prisma/PostgreSQL

Debe permitir observar:

* duración de queries;
* errores;
* transacciones;
* queries lentas;
* migraciones;
* deadlocks.

Regla:

```text id="zyxj0a"
No registrar SQL con valores sensibles en producción sin sanitización.
```

---

## 45. Instrumentación de Keycloak tokens

Cuando se use Keycloak, la API debe registrar eventos técnicos sobre validación de tokens sin exponer tokens.

Registrar:

* issuer inválido;
* audience inválida;
* token expirado;
* firma inválida;
* subject no vinculado;
* tenant inválido;
* client inválido.

No registrar:

* token completo;
* refresh token;
* client secret.

---

## 46. Instrumentación de webhooks

Registrar:

* webhook recibido;
* firma válida/inválida;
* timestamp inválido;
* event ID;
* idempotency key;
* tenant si aplica;
* resultado;
* reintento;
* error.

No registrar payload sensible completo.

---

## 47. Instrumentación de n8n

Cuando n8n llame al Core:

* registrar service account;
* workflow ID si se envía;
* tenant;
* endpoint;
* resultado;
* traceId;
* error.

n8n debe propagar `X-Correlation-Id` o equivalente cuando sea posible.

---

## 48. OpenAPI y observabilidad

La documentación OpenAPI puede incluir:

* códigos de error;
* rate limits;
* traceId en errores;
* headers de request ID;
* requisitos de autenticación;
* errores de autorización.

Ejemplo de error:

```json id="ctqwnc"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action.",
    "traceId": "req_123456"
  }
}
```

---

## 49. Impacto en SDD

Cada spec funcional debe incluir:

```text id="z8zjzt"
## Observability

- Logs required
- Metrics required
- Audit events
- Trace propagation
- Health impact
- Alerts
- Sensitive data restrictions
- Dashboards affected
```

Especialmente en módulos:

* payments;
* dues/fees;
* reconciliation;
* reports;
* files;
* identity;
* authorization;
* tenants;
* integrations.

---

## 50. Impacto en agentes IA

Los agentes IA deben respetar:

1. No registrar tokens completos.
2. No registrar contraseñas.
3. No registrar cuerpos sensibles completos.
4. No omitir traceId en errores.
5. No crear métricas con labels de alta cardinalidad.
6. No usar userId/email/cédula como label de métrica sin justificación.
7. No mezclar auditoría funcional con logs técnicos.
8. No omitir auditoría en operaciones financieras.
9. No omitir health checks.
10. No crear dashboards con datos personales innecesarios.
11. No registrar comprobantes.
12. No exponer health detailed públicamente.
13. No ocultar errores críticos sin alerta.
14. No depender solo de n8n para monitoreo crítico.
15. No crear logs que impidan cumplir protección de datos.

---

## 51. Herramientas iniciales recomendadas

### 51.1. MVP local/dev

```text id="f3p4li"
Pino o Winston para logs JSON
NestJS Terminus o health module equivalente
Docker logs
PostgreSQL logs básicos
Redis logs básicos
```

### 51.2. Staging

```text id="vugb0l"
Logs estructurados
Prometheus opcional
Grafana opcional
OpenTelemetry opcional
Sentry/GlitchTip opcional
Keycloak health/metrics
```

### 51.3. Producción inicial

```text id="oq996e"
Logs centralizados o proveedor
Health checks
Alertas básicas
Backup monitoring
Keycloak monitoring
PostgreSQL monitoring
Redis monitoring
Worker monitoring
```

### 51.4. Producción avanzada

```text id="ubj6vz"
OpenTelemetry Collector
Prometheus
Grafana
Loki
Tempo
Alertmanager
Sentry/GlitchTip
Cloud provider monitoring
```

---

## 52. Costo y madurez

No se debe sobrecargar el MVP con un stack de observabilidad empresarial completo.

Estrategia:

```text id="5k1f1k"
MVP:
logs + health + traceId + alertas básicas.

Staging/Production inicial:
métricas + dashboards + backup alerts.

Microservicios:
OpenTelemetry + tracing distribuido + dashboards por servicio.
```

---

## 53. Consecuencias positivas

Esta decisión permite:

* diagnosticar errores;
* responder incidentes;
* proteger operación financiera;
* detectar accesos indebidos;
* monitorear Keycloak;
* monitorear jobs;
* monitorear base de datos;
* preparar microservicios;
* correlacionar requests y auditoría;
* mejorar soporte a tenants;
* reducir tiempo de resolución;
* evitar dependencia de información manual.

---

## 54. Consecuencias negativas

Esta decisión implica:

* mayor trabajo inicial;
* costos de almacenamiento de logs;
* necesidad de sanitización;
* necesidad de dashboards;
* necesidad de alertas;
* mantenimiento de herramientas;
* riesgo de registrar datos sensibles si no se controla;
* necesidad de capacitación operativa;
* posible ruido de alertas si no se calibran bien.

---

## 55. Riesgos

| Riesgo                            | Impacto    | Mitigación                     |
| --------------------------------- | ---------- | ------------------------------ |
| Logs con datos sensibles          | Alto       | Sanitización y revisión        |
| Sin traceId                       | Medio-alto | Middleware obligatorio         |
| Métricas de alta cardinalidad     | Alto       | Reglas de labels               |
| Sin alertas de backup             | Crítico    | Backup monitoring              |
| Sin monitoreo de Keycloak         | Alto       | Health y métricas Keycloak     |
| Sin monitoreo de jobs financieros | Crítico    | Métricas y alertas de jobs     |
| Health detailed público           | Alto       | Restringir acceso              |
| Logs sin retención definida       | Medio      | Política de retención          |
| Auditoría confundida con logs     | Alto       | Separar responsabilidades      |
| Herramientas expuestas            | Alto       | Auth, MFA y acceso restringido |
| Alert fatigue                     | Medio      | Priorizar alertas críticas     |
| Sin runbooks                      | Alto       | Crear runbooks por incidente   |

---

## 56. Criterios de aceptación

La implementación cumple este ADR si:

* existen logs estructurados;
* cada request tiene traceId o requestId;
* los errores devuelven traceId;
* los logs no exponen secretos;
* existen health checks;
* existe health detailed protegido;
* los endpoints health usan el contrato plano y el mapeo HTTP definidos en §10;
* OpenAPI declara explícitamente la excepción al response envelope;
* se monitorea PostgreSQL;
* se monitorea Redis;
* se monitorean workers;
* se monitorea Keycloak cuando se incorpore;
* existen métricas básicas de API;
* existen métricas de jobs;
* existen alertas de caída de API y DB;
* existen alertas de backup fallido;
* operaciones financieras críticas generan auditoría;
* se puede correlacionar log técnico con auditoría funcional;
* existe política de retención;
* las specs SDD incluyen sección de observabilidad.

---

## Alternativas consideradas

- Logs de texto sin estructura como única señal: descartado por baja capacidad de correlación y análisis.
- Plataforma propietaria completa desde el inicio: diferida para evitar costo y dependencia prematuros.
- Incorporar observabilidad únicamente después del MVP: descartado porque impediría diagnosticar fallos tempranos y validar controles críticos.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/api-guidelines.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-008-api-gateway-strategy.md`
- `docs/decisions/ADR-009-deployment-strategy.md`
- `docs/decisions/ADR-011-testing-strategy.md`
- `docs/decisions/ADR-012-ci-cd-strategy.md`
- `docs/implementation/sprint-0-foundation.md`

## 57. Decisión final

RESIDENT Core adoptará una estrategia progresiva de observabilidad basada en logs estructurados, métricas, trazas, health checks, auditoría técnica, alertas y dashboards.

En el MVP se implementarán logs estructurados, request ID, health checks, errores con trace ID y métricas básicas.

En staging y producción se incorporarán métricas, alertas, dashboards, monitoreo de PostgreSQL, Redis, workers, storage, reverse proxy y Keycloak.

OpenTelemetry será el estándar objetivo para instrumentación y trazas distribuidas, especialmente antes de migrar hacia microservicios físicos.

Prometheus y Grafana serán opciones preferentes para métricas y visualización cuando la infraestructura lo justifique.

La observabilidad deberá cumplir las reglas de seguridad, privacidad y gobernanza de datos de RESIDENT Core.
