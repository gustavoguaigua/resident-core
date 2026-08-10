# ADR-008 — API Gateway Strategy: Progressive Edge Gateway for Monolith and Future Microservices

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                            |
| Documento       | ADR-008                                                                                                                                                                                                  |
| Título          | API Gateway Strategy: Progressive Edge Gateway for Monolith and Future Microservices                                                                                                                     |
| Ruta            | `docs/decisions/ADR-008-api-gateway-strategy.md`                                                                                                                                                         |
| Versión         | 0.1                                                                                                                                                                                                      |
| Estado          | accepted                                                                                                                                                                                                 |
| Fecha           | 2026-07-12                                                                                                                                                                                               |
| Relacionado con | `ADR-001-architecture-style.md`, `ADR-004-multitenancy-strategy.md`, `ADR-006-identity-provider-strategy.md`, `ADR-007-authorization-strategy.md`, `architecture.md`, `api-guidelines.md`, `security.md` |

---

## 2. Contexto

RESIDENT Core iniciará como un monolito modular contenerizado, API-first, con NestJS, PostgreSQL, Redis y Docker.

El sistema será consumido por varios clientes y componentes:

* Portal WordPress de RESIDENT.
* Frontend administrativo del Core.
* Portal de residentes.
* n8n.
* Integraciones futuras.
* Aplicación móvil futura.
* Microservicios futuros.
* Posibles herramientas internas de soporte.

La arquitectura también contempla que, en una segunda fase, algunos módulos puedan extraerse como microservicios físicos.

Por tanto, se necesita definir cómo se expondrán las APIs del sistema y qué componente asumirá responsabilidades perimetrales como TLS, routing, CORS, rate limiting, logging, trazabilidad y protección básica de tráfico.

---

## 3. Problema

Se debe definir la estrategia de API Gateway para RESIDENT Core.

La decisión debe responder:

1. ¿Se necesita API Gateway desde el MVP?
2. ¿Qué diferencia habrá entre reverse proxy, API Gateway y BFF?
3. ¿Qué responsabilidades tendrá el gateway?
4. ¿Qué responsabilidades no debe tener el gateway?
5. ¿Cómo se integrará con Keycloak?
6. ¿Cómo se integrará con WordPress?
7. ¿Cómo se integrará con n8n?
8. ¿Cómo preparará la arquitectura para microservicios?
9. ¿Cómo se controlarán CORS, rate limiting y observabilidad?
10. ¿Cómo se evitará duplicar autorización de negocio fuera del Core?

---

## 4. Decisión

RESIDENT Core adoptará una estrategia progresiva:

```text id="b5v1xz"
MVP:
Reverse Proxy / Edge Proxy delante del monolito modular.

Fase Keycloak:
Edge Proxy + validaciones perimetrales básicas + integración OIDC si se justifica.

Fase microservicios:
API Gateway formal como punto de entrada único para APIs públicas y privadas.

Fase avanzada:
BFF por tipo de cliente y/o service mesh solo si la complejidad lo justifica.
```

Decisión central:

```text id="v4nmpf"
El API Gateway no reemplaza la autorización de negocio.
```

El gateway podrá validar aspectos perimetrales y técnicos, pero RESIDENT Core seguirá autorizando operaciones por tenant, rol, permiso, recurso, estado y regla financiera.

---

## 5. Definición de componentes

### 5.1. Reverse Proxy

Componente que recibe tráfico HTTP/HTTPS y lo redirige hacia la aplicación backend.

Puede manejar:

* TLS.
* Redirección HTTP a HTTPS.
* Headers.
* Compresión.
* Límites de tamaño.
* Routing básico.
* Logs de acceso.
* Balanceo simple.

Ejemplos conceptuales:

```text id="2l4jfm"
Nginx
Traefik
Caddy
Cloudflare Tunnel / Proxy
Load Balancer del proveedor cloud
```

---

### 5.2. API Gateway

Componente especializado que actúa como punto de entrada para APIs.

Puede manejar:

* Routing avanzado.
* Rate limiting.
* Autenticación técnica.
* Validación de tokens.
* Transformación de requests.
* Políticas por ruta.
* Observabilidad.
* Versionamiento.
* API keys.
* Service accounts.
* Control de tráfico.
* Circuit breaking.
* Canary releases.
* Protección perimetral.

Ejemplos conceptuales:

```text id="9g2mhg"
Kong
Apache APISIX
Tyk
KrakenD
Envoy Gateway
Traefik Enterprise
AWS API Gateway
Azure API Management
Google API Gateway
```

---

### 5.3. BFF

Backend for Frontend.

Es un backend especializado para un tipo de cliente.

Ejemplos:

```text id="kvof9r"
resident-admin-bff
resident-mobile-bff
resident-wordpress-bff
```

Su propósito es adaptar datos, endpoints y experiencia para un frontend específico.

No se implementará al inicio salvo necesidad clara.

---

### 5.4. Service Mesh

Capa de comunicación entre servicios internos.

Ejemplos conceptuales:

```text id="pi1l4c"
Istio
Linkerd
Consul
```

No se implementará en el MVP.

Podrá evaluarse cuando existan múltiples microservicios y necesidades reales de mTLS interno, retries, observabilidad avanzada y políticas de tráfico entre servicios.

---

## 6. Arquitectura del MVP

Para el MVP se usará:

```text id="g5wvb6"
Client / WordPress / n8n
        ↓
Reverse Proxy / Edge Proxy
        ↓
RESIDENT Core API
        ↓
PostgreSQL / Redis / Storage
```

Ejemplo:

```text id="e0thsu"
https://api.resident.example.com
        ↓
reverse proxy
        ↓
resident-api:3000
```

Responsabilidades principales del reverse proxy:

* TLS.
* Routing básico.
* Redirección HTTP a HTTPS.
* Tamaño máximo de request.
* Headers de seguridad.
* Logs de acceso.
* Forwarded headers.
* Health checks.
* Protección básica de tráfico.
* CORS complementario si se decide centralizarlo.

---

## 7. Arquitectura con Keycloak

Cuando Keycloak sea incorporado:

```text id="372n3o"
Frontend / WordPress
        ↓
Keycloak Login
        ↓
Access Token
        ↓
Reverse Proxy / Edge Gateway
        ↓
RESIDENT Core API
        ↓
PostgreSQL
```

El gateway podrá, en una fase posterior, validar de forma técnica:

* issuer;
* audience;
* expiración;
* firma del token;
* ruta protegida;
* cabecera Authorization.

Pero RESIDENT Core deberá seguir validando:

* usuario local;
* tenant activo;
* membresía;
* rol;
* permiso;
* recurso;
* regla de negocio;
* auditoría.

Regla:

```text id="tgjqgl"
Token válido en el gateway no equivale a operación autorizada en el Core.
```

---

## 8. Arquitectura futura con microservicios

Cuando existan microservicios:

```text id="rqpkcl"
                      +----------------+
                      |   Keycloak     |
                      +-------+--------+
                              |
                              v
Client / WordPress / Mobile / n8n
              |
              v
+-----------------------------+
|         API Gateway         |
+-------------+---------------+
              |
  +-----------+-----------+------------+
  |                       |            |
  v                       v            v
resident-core-api   payments-service  reports-service
  |                       |            |
  v                       v            v
PostgreSQL          Payments DB/API   Read Models
```

El API Gateway actuará como punto de entrada común para los clientes externos.

Los microservicios internos no deberán ser expuestos directamente a Internet salvo justificación específica.

---

## 9. Responsabilidades del gateway

El gateway o edge proxy podrá asumir progresivamente:

### 9.1. Seguridad perimetral

* TLS.
* Headers de seguridad.
* Redirección HTTPS.
* Restricción de métodos.
* Tamaño máximo de payload.
* Protección básica contra abuso.
* Rate limiting.
* IP allowlist para integraciones críticas.
* Rechazo de tráfico inválido.
* Validación técnica de tokens en fase avanzada.

### 9.2. Routing

* Enrutar `/api/v1/*` al Core.
* Enrutar `/auth/*` a Keycloak, si se expone bajo dominio propio.
* Enrutar `/payments/*` a microservicio de pagos futuro.
* Enrutar `/reports/*` a microservicio de reportes futuro.
* Enrutar `/public/*` a endpoints públicos controlados.
* Enrutar `/health` o health checks según ambiente.

### 9.3. Observabilidad

* Access logs.
* Request ID.
* Trace ID.
* Latencia.
* Status codes.
* Métricas por ruta.
* Métricas de error.
* Métricas de rate limit.
* Integración futura con tracing distribuido.

### 9.4. Control de tráfico

* Rate limiting.
* Timeouts.
* Retries controlados.
* Circuit breaking futuro.
* Balanceo de carga.
* Canary deployments futuros.
* Blue/green deployments futuros.

### 9.5. Integración con clientes

* CORS.
* Preflight handling.
* API version routing.
* Compresión.
* Gestión de dominios.
* Normalización de headers.

---

## 10. Responsabilidades que no debe asumir el gateway

El gateway no debe asumir reglas centrales de negocio.

No debe decidir por sí solo:

* si un residente puede ver un estado de cuenta;
* si un tesorero puede confirmar un pago;
* si un propietario puede ver una unidad;
* si una multa puede reversarse;
* si un pago puede conciliarse;
* si un cargo puede cancelarse;
* si una reserva puede aprobarse;
* si un reporte financiero puede exportarse;
* si un usuario tiene relación con una unidad;
* si un usuario tiene permiso financiero dentro de un tenant específico.

Estas decisiones pertenecen a RESIDENT Core o al microservicio dueño del dominio.

Regla:

```text id="z5bjdi"
El gateway protege el borde.
El Core protege el negocio.
```

---

## 11. Fases de implementación

### 11.1. Fase 1 — MVP monolito modular

Implementar:

```text id="qa4gau"
Reverse Proxy / Edge Proxy
```

Funciones mínimas:

* HTTPS.
* Routing a `resident-api`.
* Headers de seguridad.
* Tamaño máximo de request.
* Logs de acceso.
* Health checks.
* CORS controlado.
* Rate limiting básico para login y endpoints sensibles si es viable.

No implementar todavía:

* API Gateway complejo.
* Service mesh.
* BFF.
* Routing a microservicios inexistentes.
* Autorización de negocio en gateway.

---

### 11.2. Fase 2 — Keycloak

Agregar:

* Routing hacia Keycloak.
* Configuración segura de dominios.
* Validación de redirect URIs.
* CORS compatible con frontend.
* Separación de dominios entre API, auth y frontend.
* Validación técnica de tokens en API.
* Posible validación perimetral de JWT si la herramienta lo soporta correctamente.

Ejemplo de dominios:

```text id="br4pb8"
auth.resident.example.com      → Keycloak
api.resident.example.com       → RESIDENT Core API
app.resident.example.com       → Frontend Core
www.resident.gustavoguaigua.com → WordPress portal
```

---

### 11.3. Fase 3 — Primeros microservicios

Incorporar API Gateway formal cuando exista al menos un servicio separado con exposición externa o necesidad clara de routing central.

Candidatos:

```text id="mwplsj"
payments-service
reports-service
notifications-service
files-service
```

El gateway podrá enrutar:

```text id="7yw9ef"
/api/v1/payments/*       → payments-service
/api/v1/reports/*        → reports-service
/api/v1/notifications/*  → notifications-service
/api/v1/files/*          → files-service
```

---

### 11.4. Fase 4 — BFF o Service Mesh

Evaluar BFF cuando:

* el frontend web y móvil requieran contratos muy distintos;
* las pantallas necesiten composición de varios microservicios;
* el Core no deba exponer endpoints pensados para UI;
* se requiera optimizar experiencia mobile.

Evaluar service mesh cuando:

* existan varios microservicios;
* haya comunicación interna compleja;
* se requiera mTLS servicio a servicio;
* se necesite observabilidad distribuida avanzada;
* existan despliegues canary internos;
* los retries y circuit breaking internos sean relevantes.

---

## 12. Alternativas evaluadas

### 12.1. Sin reverse proxy ni gateway

#### Ventajas

* Máxima simplicidad.
* Menos componentes.
* Menor configuración.

#### Desventajas

* Exponería directamente la aplicación.
* Peor manejo de TLS.
* Peor manejo de headers.
* Menor control de tráfico.
* Menor preparación para producción.
* Menor preparación para microservicios.

#### Resultado

Descartada.

---

### 12.2. Reverse proxy simple en MVP

#### Ventajas

* Suficiente para monolito modular.
* Bajo costo.
* Menor complejidad.
* Fácil despliegue.
* Permite TLS y routing.
* Compatible con Docker.
* Compatible con VPS o cloud.
* No sobrecarga el MVP.

#### Desventajas

* Capacidades limitadas frente a API Gateway formal.
* Políticas avanzadas requieren configuración adicional.
* Menos adecuado para múltiples microservicios.
* Puede requerir migración posterior.

#### Resultado

Aceptada para MVP.

---

### 12.3. API Gateway formal desde el inicio

#### Ventajas

* Preparación temprana para microservicios.
* Políticas centralizadas.
* Rate limiting avanzado.
* Routing avanzado.
* Observabilidad avanzada.
* Mejor control de APIs.

#### Desventajas

* Mayor complejidad.
* Mayor curva de aprendizaje.
* Mayor operación.
* Puede retrasar MVP.
* Puede ser sobrearquitectura si solo existe un backend.
* Riesgo de configurar mal seguridad.

#### Resultado

Diferida hasta que existan microservicios o necesidad operativa clara.

---

### 12.4. BFF desde el inicio

#### Ventajas

* Contratos optimizados para frontend.
* Mejor experiencia para UI.
* Reduce complejidad del frontend.
* Permite composición de datos.

#### Desventajas

* Agrega otro backend.
* Duplica parte de lógica de API.
* No es necesario si existe un solo frontend inicial.
* Puede aumentar deuda si se diseña antes de tener uso real.

#### Resultado

Descartada para MVP.

Podrá evaluarse para aplicación móvil o frontend complejo.

---

### 12.5. Service Mesh desde el inicio

#### Ventajas

* mTLS entre servicios.
* Observabilidad avanzada.
* Políticas de tráfico internas.
* Control de comunicación servicio a servicio.

#### Desventajas

* No aplica si aún no hay microservicios.
* Alta complejidad.
* Requiere mayor madurez DevOps.
* No aporta valor suficiente al MVP.

#### Resultado

Descartada para MVP y primera fase.

---

## 13. Herramientas candidatas

### 13.1. MVP

Opciones razonables:

```text id="ldk9bd"
Nginx
Traefik
Caddy
Load Balancer del proveedor cloud
Cloudflare proxy
```

Criterio:

* simple;
* documentado;
* compatible con Docker;
* bajo costo;
* fácil de operar.

---

### 13.2. API Gateway futuro

Opciones a evaluar:

```text id="z91erv"
Kong
Apache APISIX
Tyk
KrakenD
Envoy Gateway
Traefik Enterprise
AWS API Gateway
Azure API Management
Google API Gateway
```

La elección definitiva debe realizarse en un ADR futuro cuando se decida migrar a microservicios.

---

## 14. Decisión de herramienta para MVP

Para el MVP no se fija una herramienta única obligatoria.

Se permite usar:

```text id="t136t1"
Nginx, Traefik, Caddy o reverse proxy del proveedor.
```

Criterios de selección:

* facilidad de despliegue;
* soporte TLS;
* compatibilidad Docker;
* bajo costo;
* facilidad de configuración;
* documentación suficiente;
* integración con hosting elegido.

Si se usa Docker Compose local, Traefik o Nginx son opciones razonables.

Si se usa un PaaS, el gateway inicial puede ser el propio edge/load balancer del proveedor.

---

## 15. Dominios sugeridos

Ambiente local:

```text id="139fm0"
http://localhost:3000        → resident-api
http://localhost:8080        → keycloak
http://localhost:8025        → mailhog
```

Ambiente dev/staging/productivo:

```text id="zdtvgj"
app.resident.example.com     → frontend Core
api.resident.example.com     → RESIDENT Core API
auth.resident.example.com    → Keycloak
admin.resident.example.com   → administración interna futura
```

Para la FASE 1 actual:

```text id="fkm092"
www.resident.gustavoguaigua.com → WordPress Portal
```

---

## 16. Rutas iniciales

### 16.1. API Core

```text id="qe8zvm"
/api/v1/auth/*
/api/v1/tenants/*
/api/v1/users/*
/api/v1/property-units/*
/api/v1/residents/*
/api/v1/charges/*
/api/v1/payments/*
/api/v1/account-statements/*
/api/v1/reservations/*
/api/v1/fines/*
/api/v1/reports/*
/api/v1/audit/*
```

### 16.2. Endpoints públicos

```text id="zgueb2"
/api/v1/public/tenants/{slug}
/api/v1/public/tenants/{slug}/announcements
/api/v1/public/tenants/{slug}/common-areas
```

### 16.3. Health checks

```text id="h8aut3"
/health
/api/v1/health
/api/v1/health/details
```

---

## 17. API versioning

El gateway debe respetar el versionamiento de API.

Versión inicial:

```text id="iqvoif"
/api/v1
```

Reglas:

* No reescribir versiones sin ADR.
* No mezclar `/api/v1` con `/api/v2` sin estrategia.
* Mantener compatibilidad hacia WordPress y clientes externos.
* Las breaking changes deben ir a nueva versión.
* El gateway puede enrutar versiones diferentes a servicios diferentes en fase futura.

Ejemplo futuro:

```text id="g9v0a9"
/api/v1/payments → resident-core-api
/api/v2/payments → payments-service-v2
```

---

## 18. CORS

### 18.1. Principio

CORS debe ser restrictivo.

Prohibido en producción para endpoints autenticados:

```text id="8sf493"
Access-Control-Allow-Origin: *
```

### 18.2. Orígenes permitidos

Inicialmente:

```text id="82m95e"
https://www.resident.gustavoguaigua.com
https://app.resident.example.com
https://admin.resident.example.com
```

Ambientes dev/staging deberán tener listas explícitas.

### 18.3. Regla

CORS puede configurarse en gateway, backend o ambos, pero debe existir una única política documentada para evitar contradicciones.

---

## 19. Rate limiting

El gateway podrá aplicar rate limiting perimetral.

Endpoints prioritarios:

```text id="e4xl0m"
login
refresh
forgot-password
reset-password
public endpoints
file upload
file download
payment registration
webhooks
exports
search
```

El backend podrá aplicar rate limiting adicional cuando requiera contexto de usuario, tenant o permiso.

Regla:

```text id="gpd2dm"
Rate limiting perimetral no reemplaza controles de negocio.
```

---

## 20. Headers de seguridad

El edge proxy debe facilitar headers de seguridad cuando aplique:

```text id="mqq4x9"
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options or CSP frame-ancestors
Content-Security-Policy
Referrer-Policy
Permissions-Policy
```

La política final debe ajustarse según frontend, WordPress, Keycloak y ambiente.

---

## 21. Request ID y Trace ID

Todo request debe tener un identificador.

Si el cliente o gateway no lo envía, el backend debe generarlo.

Headers sugeridos:

```text id="lwkl0t"
X-Request-Id
X-Correlation-Id
traceparent
```

Reglas:

* Incluir trace ID en logs.
* Incluir trace ID en errores.
* Propagar trace ID a jobs.
* Propagar trace ID a eventos.
* Propagar trace ID a microservicios futuros.
* No incluir datos personales en trace ID.

---

## 22. Logging perimetral

El gateway debe registrar logs de acceso.

Campos sugeridos:

```text id="ezeycx"
timestamp
requestId
method
path
status
latencyMs
clientIp
userAgent
upstream
responseSize
```

No debe registrar:

* contraseñas;
* tokens completos;
* comprobantes;
* cuerpos de requests financieros;
* datos personales sensibles;
* información bancaria completa.

---

## 23. Integración con Keycloak

El gateway debe permitir exponer Keycloak bajo dominio seguro.

Ejemplo:

```text id="mo9vz3"
auth.resident.example.com
```

Reglas:

* HTTPS obligatorio.
* Hostname configurado correctamente.
* Redirect URIs explícitas.
* CORS controlado.
* No exponer consola admin innecesariamente a Internet sin controles.
* MFA para administradores de Keycloak.
* Logs de acceso.
* Backups de base Keycloak.
* Rotación de secretos de clients.

---

## 24. Integración con WordPress

WordPress en FASE 1 seguirá como portal informativo.

Flujo recomendado:

```text id="cd40l1"
WordPress tenant page
        ↓
Botón Acceso Residentes
        ↓
Keycloak / Core Login
        ↓
Core Dashboard
```

Reglas:

* WordPress no accede directo a PostgreSQL.
* WordPress no autoriza operaciones.
* WordPress no almacena datos financieros.
* WordPress no almacena comprobantes.
* WordPress puede consumir endpoints públicos.
* WordPress puede enviar una pista de tenant por slug.
* El gateway puede permitir solo rutas públicas específicas hacia WordPress.

---

## 25. Integración con n8n

n8n debe consumir APIs mediante endpoints controlados.

Reglas:

* Preferir service account.
* Usar scopes mínimos.
* Usar tenant explícito cuando corresponda.
* Validar webhooks.
* Aplicar rate limiting.
* Auditar acciones críticas.
* No conectar n8n directamente a PostgreSQL en producción.
* No exponer endpoints internos sin protección.

Rutas futuras posibles:

```text id="xxl692"
/api/v1/integrations/n8n/*
/api/v1/webhooks/*
```

---

## 26. Webhooks

Los webhooks deben protegerse con:

* firma;
* timestamp;
* idempotency key;
* validación de origen;
* rate limiting;
* auditoría;
* reintentos controlados;
* payload mínimo.

Headers sugeridos:

```text id="05jkn3"
X-Resident-Signature
X-Resident-Timestamp
X-Resident-Event-Id
Idempotency-Key
```

El gateway puede filtrar tráfico inválido, pero el backend debe validar la firma.

---

## 27. Archivos y cargas

Endpoints de archivos deben tener controles perimetrales y de negocio.

Controles del gateway:

* tamaño máximo de request;
* timeout;
* rate limit;
* bloqueo de métodos no permitidos.

Controles del backend:

* autenticación;
* autorización;
* tenant;
* tipo de archivo;
* tamaño;
* antivirus o análisis futuro;
* storage privado;
* auditoría;
* URL firmada o descarga autenticada.

---

## 28. Timeouts y límites

Valores iniciales sugeridos:

| Tipo              |     Valor inicial |
| ----------------- | ----------------: |
| Request normal    |       30 segundos |
| Upload de archivo | 60 a 120 segundos |
| Reporte pesado    |         Asíncrono |
| Webhook           |  10 a 30 segundos |
| Health check      |        5 segundos |

Regla:

```text id="lae4tp"
Los procesos pesados deben moverse a jobs asíncronos.
```

---

## 29. Respuestas de error

El gateway no debe exponer detalles internos.

Errores perimetrales:

```text id="1t3lbd"
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
413 Payload Too Large
429 Too Many Requests
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

Reglas:

* No revelar stack traces.
* No revelar IPs internas.
* No revelar nombres internos de servicios.
* Incluir request ID cuando sea posible.
* Mantener formato de error consistente desde backend.

---

## 30. API Gateway y autorización

El gateway podrá hacer validaciones coarse-grained.

Ejemplos:

* ruta requiere token;
* token no expirado;
* audience válida;
* scope técnico básico.

Pero no debe hacer autorización fina.

Ejemplo:

```text id="aasrfl"
Gateway:
¿El request tiene token válido para resident-api?

Core:
¿El usuario puede confirmar este pago del Tenant Villa Club?
```

---

## 31. API Gateway y microservicios

Cuando existan microservicios, el gateway deberá enrutar por dominio.

Ejemplo:

```text id="2amtdh"
/api/v1/payments/*        → payments-service
/api/v1/reports/*         → reports-service
/api/v1/notifications/*   → notifications-service
/api/v1/files/*           → files-service
/api/v1/tenants/*         → resident-core-api
```

Cada microservicio debe validar token y autorización de dominio.

El gateway no debe ser el único punto de seguridad.

---

## 32. API Gateway y OpenAPI

Cada servicio deberá publicar su contrato OpenAPI.

El gateway podrá agregarlos o exponer documentación centralizada en fase futura.

Reglas:

* OpenAPI por servicio.
* Versionamiento explícito.
* Endpoints públicos y privados claramente marcados.
* Permisos documentados.
* Errores documentados.
* Tags por módulo o servicio.

---

## 33. Service-to-service communication

En el MVP no aplica porque existe monolito modular.

En microservicios futuros:

* las llamadas internas deben autenticarse;
* pueden usar tokens de servicio;
* pueden usar mTLS en fase avanzada;
* deben propagar trace ID;
* deben evitar datos sensibles innecesarios;
* deben respetar contratos;
* deben aplicar timeouts;
* deben manejar fallos.

---

## 34. Service accounts

El gateway puede ayudar a controlar integraciones técnicas.

Ejemplos:

* n8n.
* importador bancario.
* WordPress server-to-server.
* microservicios internos.

Reglas:

* No usar cuentas humanas.
* Usar client credentials cuando aplique.
* Limitar scopes.
* Rotar secretos.
* Auditar uso.
* Separar por integración.
* Revocar cuando sea necesario.

---

## 35. Ambientes

### 35.1. Local

Puede usarse Docker Compose sin gateway formal o con reverse proxy local opcional.

```text id="adfeg6"
localhost:3000 → resident-api
localhost:8080 → keycloak
```

### 35.2. Dev

Debe tener dominios o rutas separadas para API, auth y frontend.

### 35.3. Staging

Debe parecerse lo más posible a producción.

Debe probar:

* CORS;
* login;
* redirect URIs;
* rate limiting;
* archivos;
* webhooks;
* health checks;
* WordPress integration.

### 35.4. Producción

Debe tener:

* HTTPS.
* Certificados válidos.
* Headers de seguridad.
* Logs.
* Rate limiting.
* Health checks.
* Monitoring.
* Backup de configuraciones.
* Protección de admin endpoints.

---

## 36. Despliegue local sugerido

Ejemplo conceptual:

```text id="flbi09"
docker-compose.yml
├── reverse-proxy
├── resident-api
├── postgres
├── redis
├── keycloak
├── keycloak-postgres
├── minio
└── mailhog
```

El reverse proxy local puede omitirse al inicio, pero debe incorporarse antes de staging.

---

## 37. Relación con Cloudflare o proveedor edge

Si se usa Cloudflare u otro edge provider, podrá proveer:

* DNS.
* TLS.
* protección básica;
* WAF básico según plan;
* caching de contenido público;
* reglas de firewall;
* rate limiting según disponibilidad.

Regla:

```text id="k1j9g6"
No cachear endpoints autenticados ni datos financieros sensibles.
```

---

## 38. Cache

El gateway o edge solo debe cachear contenido público y seguro.

Permitido:

* perfil público del tenant;
* assets públicos;
* información institucional pública;
* comunicados públicos autorizados.

Prohibido:

* estados de cuenta;
* pagos;
* comprobantes;
* saldos;
* reportes financieros;
* datos personales;
* auditoría;
* tokens;
* respuestas autenticadas sensibles.

---

## 39. Seguridad de administración

Si se implementa API Gateway formal, su consola de administración debe protegerse.

Reglas:

* No exponer admin UI públicamente sin controles.
* MFA para administradores.
* IP allowlist si aplica.
* Credenciales seguras.
* Logs de administración.
* Backups de configuración.
* Control de cambios.
* Separar ambiente dev/staging/prod.

---

## 40. Configuración como código

La configuración del gateway debe versionarse cuando sea posible.

Ejemplos:

```text id="7dgnep"
routes
services
upstreams
plugins
rate limits
CORS policies
JWT validation
headers
timeouts
```

Regla:

```text id="reuj8u"
La configuración crítica del gateway debe ser reproducible.
```

---

## 41. Observabilidad futura

El gateway debe integrarse progresivamente con:

* métricas;
* logs estructurados;
* tracing distribuido;
* alertas;
* dashboards;
* error rates;
* latency percentiles.

Métricas sugeridas:

```text id="lbo3lw"
requests_total
request_duration_ms
upstream_errors_total
rate_limited_requests_total
auth_failures_total
payload_too_large_total
gateway_timeouts_total
```

---

## 42. Impacto en SDD

Cada spec de módulo debe indicar:

* si el endpoint es público, privado o global;
* si requiere gateway policy;
* si requiere rate limiting;
* si permite CORS desde WordPress;
* si admite carga de archivos;
* si es webhook;
* si debe estar disponible para n8n;
* si puede ser cacheado;
* si podrá moverse a microservicio futuro;
* si requiere documentación OpenAPI separada.

---

## 43. Impacto en agentes IA

Los agentes IA deben respetar:

1. No exponer microservicios directamente sin pasar por estrategia definida.
2. No poner autorización de negocio en gateway.
3. No crear endpoints públicos para datos sensibles.
4. No permitir CORS `*` en endpoints autenticados.
5. No cachear datos financieros.
6. No omitir rate limiting en login, webhooks y exports.
7. No registrar tokens completos en gateway logs.
8. No generar rutas sin versionamiento.
9. No crear service accounts con permisos totales.
10. No asumir que gateway validó tenant.
11. No omitir validación backend aunque exista gateway.
12. No exponer panel admin del gateway sin protección.

---

## 44. Consecuencias positivas

Esta decisión permite:

* avanzar rápido con el MVP;
* evitar sobrearquitectura inicial;
* proteger el borde desde etapas tempranas;
* preparar la migración a microservicios;
* integrar Keycloak correctamente;
* controlar CORS y rate limiting;
* mejorar observabilidad;
* mantener autorización de negocio dentro del Core;
* reducir exposición directa de servicios;
* permitir evolución hacia API Gateway formal.

---

## 45. Consecuencias negativas

Esta decisión implica:

* se requerirá una migración o ampliación futura del reverse proxy a API Gateway;
* habrá que mantener configuración perimetral;
* puede haber duplicidad si CORS o rate limiting se configuran en gateway y backend sin coordinación;
* una mala configuración puede bloquear login o integraciones;
* cuando existan microservicios, la complejidad de routing crecerá;
* se necesitará documentación operativa adicional.

---

## 46. Riesgos

| Riesgo                                | Impacto | Mitigación                                |
| ------------------------------------- | ------- | ----------------------------------------- |
| Exponer API directamente sin proxy    | Alto    | Reverse proxy obligatorio en staging/prod |
| CORS mal configurado                  | Alto    | Lista explícita de orígenes               |
| Gateway asume autorización de negocio | Crítico | Regla: Core autoriza negocio              |
| Tokens completos en logs              | Alto    | Sanitizar logs                            |
| Cache de datos sensibles              | Crítico | Cache solo para contenido público         |
| Rate limiting ausente en login        | Alto    | Rate limit en gateway/backend             |
| WordPress accede a endpoints privados | Alto    | Separar endpoints públicos                |
| Microservicio expuesto directamente   | Alto    | Gateway obligatorio en microservicios     |
| Admin UI del gateway expuesta         | Alto    | MFA, allowlist, no exposición pública     |
| Configuración manual no reproducible  | Medio   | Configuración como código                 |

---

## 47. Criterios de aceptación

La implementación cumple este ADR si:

* En staging y producción existe reverse proxy o edge proxy.
* La API no se expone directamente sin control perimetral.
* HTTPS está habilitado en producción.
* CORS está restringido.
* Existen headers de seguridad básicos.
* Existen logs de acceso sin datos sensibles.
* Existe request ID o trace ID.
* Existen health checks.
* Login, refresh, webhooks y exports tienen rate limiting o plan definido.
* WordPress solo consume endpoints públicos o controlados.
* Keycloak se expone bajo dominio seguro cuando se implemente.
* El gateway no reemplaza autorización de negocio.
* La migración futura a API Gateway formal está documentada.
* Las specs SDD declaran necesidades perimetrales por endpoint.

---

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/api-guidelines.md`
- `docs/decisions/ADR-001-architecture-style.md`
- `docs/decisions/ADR-006-identity-provider-strategy.md`
- `docs/decisions/ADR-007-authorization-strategy.md`
- `docs/decisions/ADR-009-deployment-strategy.md`

## 48. Decisión final

RESIDENT Core adoptará una estrategia progresiva de gateway.

Durante el MVP se usará un reverse proxy o edge proxy simple delante del monolito modular.

Cuando se incorpore Keycloak, el edge proxy deberá soportar routing seguro hacia el proveedor de identidad y hacia la API.

Cuando RESIDENT evolucione hacia microservicios físicos, se incorporará un API Gateway formal como punto de entrada común para servicios externos y clientes.

El gateway protegerá el borde, pero no reemplazará la autorización de negocio. RESIDENT Core y los futuros microservicios seguirán validando tenant, roles, permisos, recursos, estados y reglas financieras.
