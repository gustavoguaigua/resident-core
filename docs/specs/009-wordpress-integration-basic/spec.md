# Spec 009 — WordPress Integration Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                             |
| Spec ID         | 009                                                                                                                                                       |
| Módulo          | WordPress Integration Basic                                                                                                                               |
| Documento       | Functional Specification                                                                                                                                  |
| Ruta            | `docs/specs/009-wordpress-integration-basic/spec.md`                                                                                                      |
| Versión         | 0.1                                                                                                                                                       |
| Estado          | needs-review                                                                                                                                              |
| Fecha           | 2026-07-14                                                                                                                                                |
| Prioridad       | Alta                                                                                                                                                      |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |
| Relacionado con | Portal WordPress multitenant, CPT `conjunto`, ACF, API REST, Keycloak futuro, integración portal-Core                                                     |

---

## 2. Nombre de la funcionalidad

```text id="j3w9fr"
WordPress Integration Basic
```

---

## 3. Propósito

El módulo `009-wordpress-integration-basic` define la integración inicial entre el portal multitenant WordPress de RESIDENT y RESIDENT Core.

La Fase 1 del proyecto ya cuenta con un portal WordPress multitenant funcional en:

```text id="f8gjf2"
https://www.resident.gustavoguaigua.com
```

Ese portal usa WordPress como capa pública, visual e informativa para mostrar información de cada conjunto residencial. La Fase 2 incorpora RESIDENT Core como sistema transaccional, financiero y operativo.

Regla central:

```text id="g82cep"
WordPress es la capa pública e informativa; RESIDENT Core es la fuente de verdad transaccional, financiera, operativa y de seguridad.
```

---

## 4. Objetivo funcional

Permitir que WordPress consuma información pública y semipública de RESIDENT Core de forma segura, controlada y multitenant, sin acceder directamente a la base de datos del Core.

El objetivo inicial es habilitar:

* vinculación entre CPT `conjunto` en WordPress y `tenant` en RESIDENT Core;
* consulta pública de información básica del tenant;
* consulta pública de branding;
* consulta pública de datos institucionales permitidos;
* consulta pública de áreas comunales visibles;
* consulta pública de comunicados visibles;
* enlaces seguros hacia el sistema transaccional;
* base para futuro SSO con Keycloak;
* base para futuro portal de residentes;
* control de CORS;
* rate limiting;
* auditoría de accesos relevantes;
* separación clara entre información pública y transaccional.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="i5jzdp"
1. Mapeo WordPress CPT conjunto ↔ RESIDENT Core tenant.
2. Endpoints públicos para información básica del tenant.
3. Endpoints públicos para branding.
4. Endpoints públicos para áreas comunales visibles.
5. Endpoints públicos para comunicados visibles.
6. Endpoint de estado público del tenant.
7. Enlaces seguros desde WordPress hacia RESIDENT Core.
8. Configuración de CORS para dominios WordPress autorizados.
9. API keys o client credentials para integraciones servidor-servidor si se requieren.
10. Rate limiting para endpoints públicos.
11. Contrato REST inicial.
12. Reglas de caché para WordPress.
13. Reglas de datos públicos.
14. Reglas de seguridad.
15. Auditoría de eventos relevantes.
16. Pruebas funcionales, API, seguridad, multitenancy y CORS.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="m6zwfe"
- SSO completo con Keycloak.
- Login de residentes desde WordPress.
- Portal transaccional embebido dentro de WordPress.
- Pagos desde WordPress.
- Consulta de estados de cuenta desde WordPress.
- Consulta de saldos desde WordPress.
- Consulta de comprobantes desde WordPress.
- Reserva de áreas comunales desde WordPress.
- Modificación de datos del Core desde WordPress.
- Webhooks bidireccionales avanzados.
- Sincronización automática completa WordPress ↔ Core.
- Plugin WordPress personalizado completo.
- Bloques Gutenberg personalizados.
- Shortcodes avanzados.
- GraphQL.
- Administración de tenants desde WordPress.
- Escritura directa en RESIDENT Core desde WordPress.
- Acceso directo de WordPress a la base de datos del Core.
```

Estos temas podrán abordarse en specs futuras.

---

## 6. Contexto de WordPress Fase 1

El portal WordPress usa:

```text id="wq2qly"
WordPress
Astra Free
Astra Child
Spectra/Gutenberg
CPT UI
ACF Free
LiteSpeed Cache
```

CPT principal:

```text id="czpr3x"
conjunto
```

Slug plural:

```text id="dw7w2b"
conjuntos
```

Plantilla individual:

```text id="up1b5i"
single-conjunto.php
```

Campos ACF existentes:

```text id="s5dy6o"
logo
banner_principal
color_primario
color_secundario
slogan
url_residentes
whatsapp
telefono
email
direccion
facebook
instagram
youtube
historia
mision
vision
foto_1
foto_2
foto_3
foto_4
foto_5
foto_6
```

---

## 7. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="a0w3sl"
External Integrations
```

Se relaciona con:

```text id="ihk67a"
Tenant Management
Identity and Access
Residents and Properties
Communications and Notifications
Reservations and Rentals
Reporting and Analytics
Audit and Compliance
```

Relación conceptual:

```text id="rnnhjj"
WordPress Portal
    ↓ HTTPS / REST
RESIDENT Core Public API
    ↓
Tenant / Communications / Common Areas / Reports public-safe views
```

---

## 8. Principios

### 8.1. WordPress no es fuente transaccional

WordPress no debe almacenar ni procesar información financiera transaccional.

Prohibido:

```text id="bujcph"
saldos
pagos
comprobantes
alícuotas personales
estados de cuenta
asignaciones de pago
mora individual
datos sensibles de residentes
credenciales Core
tokens de usuario
```

---

### 8.2. Core es fuente de verdad

RESIDENT Core es fuente oficial para:

```text id="zmk75o"
tenants
usuarios
roles
permisos
residentes
unidades
cargos
pagos
estados de cuenta
balances
auditoría
reportes
```

---

### 8.3. Integración API-first

Toda comunicación debe pasar por API.

Prohibido:

```text id="b0cv6j"
WordPress conectándose a PostgreSQL
WordPress leyendo tablas internas del Core
WordPress escribiendo en tablas del Core
WordPress usando credenciales de base de datos
WordPress accediendo a servicios internos no públicos
```

---

### 8.4. Datos públicos mínimos

Los endpoints públicos deben exponer solo datos explícitamente permitidos.

Regla:

```text id="xpiw3x"
Todo campo expuesto a WordPress debe clasificarse como público o publicable.
```

---

### 8.5. Multitenancy por slug/dominio

WordPress identifica cada conjunto mediante:

```text id="eucs4h"
slug
dominio
subdominio
externalPublicId
```

En MVP se recomienda usar `slug`.

---

### 8.6. Caché controlado

Los endpoints públicos pueden cachearse.

Regla:

```text id="th86h3"
Nunca cachear datos privados, financieros o personalizados en WordPress.
```

---

### 8.7. Seguridad por defecto

Todo endpoint público debe tener:

* validación de parámetros;
* rate limiting;
* CORS controlado;
* respuesta mínima;
* errores seguros;
* observabilidad;
* pruebas.

---

## 9. Actores

### 9.1. Visitante público

Usuario no autenticado que visita el portal WordPress.

Puede ver:

* información pública del conjunto;
* branding;
* historia;
* misión;
* visión;
* contactos públicos;
* fotos públicas;
* áreas comunales visibles;
* comunicados públicos.

No puede ver:

* saldos;
* pagos;
* estados de cuenta;
* datos personales;
* datos financieros;
* auditoría;
* información restringida.

---

### 9.2. Administrador WordPress

Usuario que administra el contenido del portal.

Puede configurar en WordPress:

* CPT `conjunto`;
* campos ACF;
* slug;
* datos visuales;
* enlaces hacia RESIDENT Core.

No debe administrar datos transaccionales del Core.

---

### 9.3. TenantAdmin

Usuario administrativo del Core.

Puede configurar datos publicables del tenant en RESIDENT Core si se habilita.

---

### 9.4. PlatformAdmin

Usuario de plataforma.

Puede configurar relación Core ↔ WordPress:

* dominios permitidos;
* slug;
* externalPublicId;
* estado de publicación;
* mapping WordPress.

---

### 9.5. RESIDENT Core API

Sistema que expone datos controlados a WordPress.

---

### 9.6. WordPress frontend

Cliente consumidor de endpoints públicos.

---

## 10. Definiciones

### 10.1. WordPress Portal

Sitio público multitenant construido en WordPress para mostrar la presencia digital de cada conjunto.

---

### 10.2. CPT `conjunto`

Custom Post Type de WordPress que representa un conjunto residencial.

---

### 10.3. Tenant

Entidad en RESIDENT Core que representa un conjunto residencial.

---

### 10.4. Tenant Slug

Identificador legible usado para resolver un tenant en APIs públicas.

Ejemplo:

```text id="d9xvcu"
san-jose-la-salle-2
altos-del-norte
jardines-del-valle
portal-del-rio
```

---

### 10.5. Public Tenant Profile

Vista pública del tenant expuesta a WordPress.

---

### 10.6. WordPress Mapping

Relación entre un CPT `conjunto` y un `tenant` del Core.

---

### 10.7. Public Endpoint

Endpoint accesible sin autenticación de usuario final, pero con controles de seguridad.

---

### 10.8. Integration Client

Cliente técnico autorizado para consumir endpoints con mayor capacidad si se habilita integración servidor-servidor.

---

## 11. Supuestos

1. WordPress ya está operativo.
2. Existe CPT `conjunto`.
3. Cada conjunto tiene un slug único en WordPress.
4. RESIDENT Core tendrá tenants con slug único.
5. La relación inicial será `wordpress.conjunto.slug` ↔ `core.tenant.slug`.
6. WordPress no almacenará datos transaccionales sensibles.
7. WordPress consumirá APIs públicas vía HTTPS.
8. Core expondrá endpoints públicos limitados.
9. CORS estará restringido a dominios autorizados.
10. Los datos públicos podrán cachearse.
11. Los datos privados no estarán disponibles en esta spec.
12. SSO con Keycloak queda diferido.
13. El portal de residentes queda diferido.
14. No habrá GraphQL en MVP.
15. No habrá plugin WordPress avanzado en MVP.
16. La integración inicial puede hacerse con llamadas REST desde plantilla PHP o JavaScript controlado.
17. La publicación de datos desde Core hacia WordPress será read-only en MVP.
18. Toda configuración sensible debe estar fuera del repositorio.

---

## 12. Reglas de negocio

### BR-001 — Todo tenant publicable debe tener slug único

El `tenant.slug` debe ser único.

```text id="pbyaih"
tenant.slug unique
```

---

### BR-002 — WordPress debe resolver tenant por slug

La integración básica debe permitir:

```text id="sny6jl"
GET /api/v1/public/tenants/{slug}
```

---

### BR-003 — Solo tenants activos pueden publicarse

Un tenant suspendido, inactivo o archivado no debe exponerse como activo.

Estados permitidos para publicación ordinaria:

```text id="mmhkqm"
active
```

Estados con respuesta restringida:

```text id="fb6j9o"
pendingSetup
suspended
inactive
archived
```

---

### BR-004 — Datos financieros no son públicos

Ningún endpoint público debe exponer:

```text id="jmm9dw"
saldos
deuda
pagos
cargos personales
mora individual
estado de cuenta
comprobantes
```

---

### BR-005 — Datos personales no son públicos

Ningún endpoint público debe exponer:

```text id="dctnw0"
nombres de residentes
nombres de propietarios
emails personales
teléfonos personales
identificaciones
vehículos personales
mascotas por residente
contactos de emergencia
```

---

### BR-006 — Branding puede ser público

Los siguientes datos pueden exponerse si el tenant está activo:

```text id="phingd"
logoUrl
bannerUrl
primaryColor
secondaryColor
slogan
publicName
publicDescription
```

---

### BR-007 — Contactos públicos pueden exponerse

Solo contactos institucionales del conjunto:

```text id="h2rz9h"
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

---

### BR-008 — Comunicados deben tener visibilidad

Un comunicado solo puede exponerse si:

```text id="j8mj4o"
visibility = public
status = published
tenantId = resolvedTenant.id
```

---

### BR-009 — Áreas comunales deben tener visibilidad pública

Un área comunal solo puede exponerse en WordPress si:

```text id="yp8k0o"
isPublicVisible = true
status = active
tenantId = resolvedTenant.id
```

---

### BR-010 — WordPress no debe enviar datos sensibles al Core público

Los endpoints públicos no deben aceptar payloads sensibles.

---

### BR-011 — CORS restringido

Solo dominios autorizados del portal pueden consumir la API desde navegador.

---

### BR-012 — Rate limiting obligatorio

Todo endpoint público debe tener rate limiting.

---

### BR-013 — Cache público permitido con TTL

Endpoints públicos pueden usar cache controlado.

---

### BR-014 — No mezclar tenants

Un slug de un tenant no debe devolver datos de otro tenant.

---

### BR-015 — Mapping auditable

Cambios de `wordpressMapping` deben auditarse.

Evento:

```text id="l1zdh3"
tenant.wordpressMapping.updated
```

---

### BR-016 — Fallback seguro

Si el Core no responde, WordPress puede mostrar datos locales ACF, pero no debe inventar datos financieros ni privados.

---

### BR-017 — API pública no requiere token de usuario final

Los endpoints públicos pueden ser anónimos, pero controlados.

---

### BR-018 — Endpoints semiprivados requieren client credentials

Si se crea un endpoint más amplio para servidor-servidor, debe requerir credencial técnica.

---

### BR-019 — Datos publicables deben clasificarse

Cada campo expuesto debe tener clasificación:

```text id="qxw4f7"
public
publicDerived
restricted
private
sensitive
```

Solo `public` y `publicDerived` pueden salir por endpoints públicos.

---

### BR-020 — OpenAPI debe documentar exposición pública

Todo endpoint público debe documentarse como `public-safe`.

---

## 13. Historias de usuario

### US-001 — Resolver tenant desde WordPress

Como WordPress frontend, quiero consultar el tenant por slug para mostrar información pública del conjunto correspondiente.

#### Criterios de aceptación

* Recibe `slug`.
* Devuelve tenant público si está activo.
* No devuelve datos financieros.
* No devuelve datos personales.
* Retorna 404 si no existe o no es publicable.
* Aplica rate limiting.

---

### US-002 — Mostrar branding del conjunto

Como visitante del portal, quiero ver logo, banner, colores y slogan del conjunto.

#### Criterios de aceptación

* WordPress puede consumir branding desde Core.
* Los URLs de imágenes son públicos o firmados según política.
* No se exponen rutas internas.
* Se permite cache.

---

### US-003 — Mostrar datos públicos de contacto

Como visitante del portal, quiero ver los contactos públicos del conjunto.

#### Criterios de aceptación

* Muestra email institucional, teléfono, WhatsApp, dirección y redes si existen.
* No muestra datos personales de administradores o residentes.
* No muestra información financiera.

---

### US-004 — Mostrar comunicados públicos

Como visitante, quiero ver comunicados publicados y públicos del conjunto.

#### Criterios de aceptación

* Solo muestra `visibility = public`.
* Solo muestra `status = published`.
* Respeta tenant.
* Permite paginación.
* Permite cache.

---

### US-005 — Mostrar áreas comunales visibles

Como visitante, quiero ver áreas comunales visibles del conjunto.

#### Criterios de aceptación

* Solo muestra áreas activas y públicas.
* No permite reservar desde WordPress en MVP.
* No muestra disponibilidad interna en tiempo real si no está publicable.
* No expone reglas privadas.

---

### US-006 — Enlazar hacia portal de residentes

Como visitante o residente, quiero acceder desde WordPress al sistema transaccional de RESIDENT Core.

#### Criterios de aceptación

* WordPress muestra enlace seguro.
* El enlace no contiene tokens.
* El enlace puede apuntar a login futuro Keycloak/Core.
* No expone credenciales.

---

### US-007 — Configurar mapping WordPress-Core

Como PlatformAdmin, quiero asociar un tenant del Core con su slug/dominio WordPress para controlar la integración.

#### Criterios de aceptación

* Se guarda `wordpressSlug`.
* Se guarda `wordpressUrl`.
* Se guarda `allowedOrigin`.
* Cambios se auditan.
* No permite duplicidad insegura.

---

## 14. Requisitos funcionales

### FR-001 — Consultar tenant público por slug

El sistema debe exponer un endpoint público para obtener información básica de un tenant activo.

---

### FR-002 — Consultar branding público

El sistema debe exponer branding público del tenant.

---

### FR-003 — Consultar datos institucionales públicos

El sistema debe exponer información institucional permitida.

---

### FR-004 — Consultar comunicados públicos

El sistema debe permitir listar comunicados públicos publicados.

---

### FR-005 — Consultar detalle de comunicado público

El sistema debe permitir consultar un comunicado público por identificador o slug.

---

### FR-006 — Consultar áreas comunales visibles

El sistema debe permitir listar áreas comunales marcadas como públicas.

---

### FR-007 — Consultar enlaces públicos del tenant

El sistema debe exponer enlaces permitidos, como portal de residentes.

---

### FR-008 — Configurar mapping WordPress-Core

El sistema debe permitir a PlatformAdmin o TenantAdmin autorizado configurar campos de integración WordPress.

---

### FR-009 — Validar origen WordPress

El sistema debe validar CORS contra orígenes autorizados.

---

### FR-010 — Rate limiting público

El sistema debe aplicar rate limiting en endpoints públicos.

---

### FR-011 — Cache headers

El sistema debe devolver headers de caché adecuados para endpoints públicos.

---

### FR-012 — No exponer datos privados

El sistema debe impedir exposición de datos financieros, personales o transaccionales privados.

---

### FR-013 — Auditar cambios de mapping

El sistema debe auditar cambios en configuración WordPress.

---

### FR-014 — Auditar accesos anómalos o denegados

El sistema debe auditar intentos relevantes de acceso indebido si corresponde.

---

### FR-015 — Documentar endpoints públicos

El sistema debe documentar en OpenAPI los endpoints públicos.

---

## 15. Requisitos no funcionales

### NFR-001 — Seguridad

Todos los endpoints públicos deben validar parámetros, limitar tasa y evitar exposición de datos sensibles.

---

### NFR-002 — Multitenancy

Toda consulta pública debe resolverse contra un único tenant.

---

### NFR-003 — Disponibilidad

Endpoints públicos deben ser livianos y cacheables.

---

### NFR-004 — Performance

Los endpoints públicos deben responder rápido para uso en WordPress.

Objetivo inicial:

```text id="o74ubt"
p95 < 500 ms para endpoints públicos cacheables
```

---

### NFR-005 — Cacheabilidad

Datos públicos deben permitir caché con TTL.

---

### NFR-006 — Observabilidad

La integración debe emitir logs y métricas sanitizadas.

---

### NFR-007 — Compatibilidad WordPress

Las respuestas deben ser fáciles de consumir desde PHP, JavaScript o plantillas WordPress.

---

### NFR-008 — Evolución

La integración debe permitir futuro SSO, portal de residentes, plugin WordPress y sincronización avanzada.

---

## 16. Datos públicos permitidos

### 16.1. Tenant público

```text id="x3zh7j"
tenantPublicId
slug
publicName
status publicable
slogan
publicDescription
websiteUrl
residentPortalUrl
```

---

### 16.2. Branding

```text id="gq0yci"
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
```

---

### 16.3. Contacto institucional

```text id="skqq2e"
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

---

### 16.4. Información institucional

```text id="ytcvup"
history
mission
vision
publicRulesSummary opcional
```

---

### 16.5. Comunicados públicos

```text id="ctqoj8"
id
slug
title
summary
content
publishedAt
coverImageUrl
category
```

---

### 16.6. Áreas comunales públicas

```text id="fxgleh"
id
slug
name
description
coverImageUrl
galleryUrls
publicRulesSummary
isPublicVisible
```

---

## 17. Datos prohibidos en endpoints públicos

```text id="l38u95"
tenant internal id secuencial si expone enumeración
resident names
owner names
personal emails
personal phones
identification numbers
property ownership details
unit balances
charges
payments
payment receipts
account statements
audit logs
role assignments
permissions
invitations
tokens
session data
api keys
internal configuration
database identifiers innecesarios
```

---

## 18. Modelo preliminar de configuración

La configuración puede extender el modelo `Tenant` o una tabla separada futura.

MVP recomendado:

```text id="nt1h0a"
Tenant
├── slug
├── publicName
├── publicStatus
├── publicDescription
├── publicEmail
├── publicPhone
├── publicWhatsapp
├── publicAddress
├── websiteUrl
├── residentPortalUrl
├── wordpressSlug
├── wordpressUrl
├── wordpressAllowedOrigin
├── isPublicVisible
├── branding
└── publicMetadata
```

Si se decide separar:

```text id="ywsc02"
TenantPublicProfile
TenantWordPressMapping
```

La decisión final se detallará en `data-model.md`.

---

## 19. API preliminar

### 19.1. Endpoints públicos

```text id="p0lr8c"
GET /api/v1/public/tenants/{slug}
GET /api/v1/public/tenants/{slug}/branding
GET /api/v1/public/tenants/{slug}/contact
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
GET /api/v1/public/tenants/{slug}/links
```

---

### 19.2. Endpoints administrativos de mapping

```text id="sfz66t"
GET   /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

Platform:

```text id="d41oc6"
GET   /api/v1/platform/tenants/{tenantId}/integrations/wordpress
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

---

## 20. Permisos iniciales

### 20.1. Permisos tenant

```text id="sx2lyz"
integrations.wordpress.read
integrations.wordpress.update
```

---

### 20.2. Permisos platform

```text id="n95d84"
integrations.wordpress.platform.read
integrations.wordpress.platform.update
```

---

### 20.3. Endpoints públicos

Los endpoints públicos no requieren permiso de usuario, pero sí controles:

```text id="ak95ui"
rate limiting
CORS
input validation
public visibility checks
safe response DTOs
```

---

## 21. CORS

### 21.1. Orígenes permitidos

Cada tenant puede declarar:

```text id="pphfwx"
wordpressAllowedOrigin
```

Ejemplo:

```text id="n5tpuq"
https://www.resident.gustavoguaigua.com
https://resident.gustavoguaigua.com
```

---

### 21.2. Prohibido

```text id="tlq5ry"
Access-Control-Allow-Origin: *
```

en producción para endpoints que puedan ser consumidos por WordPress.

---

### 21.3. Validación

La validación de CORS debe considerar:

* ambiente;
* tenant;
* slug;
* origen;
* lista blanca;
* configuración platform.

---

## 22. Cache

### 22.1. Cache permitido

Endpoints públicos pueden usar:

```text id="qd1c06"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

---

### 22.2. Cache no permitido

No cachear públicamente:

```text id="at24w9"
datos personalizados
datos financieros
datos privados
responses con tokens
errores sensibles
```

---

### 22.3. Invalidación

MVP puede depender de TTL.

Futuro:

```text id="eryi2k"
webhook de invalidación
purge LiteSpeed Cache
eventos de actualización
```

---

## 23. Auditoría

### 23.1. Eventos obligatorios

Cambios de configuración:

```text id="m8r8dw"
tenant.wordpressMapping.updated
tenant.publicProfile.updated
tenant.publicVisibility.updated
```

---

### 23.2. Eventos recomendados

```text id="ho3v14"
wordpress.publicEndpoint.accessDenied
wordpress.origin.denied
wordpress.tenantSlug.notFound
wordpress.integration.updated
```

No auditar cada visita pública ordinaria para evitar volumen excesivo.

---

### 23.3. Metadata permitida

```text id="xvcd8u"
slug
origin
endpoint
result
reason
traceId
```

Prohibido:

```text id="nmvplq"
payload completo
tokens
headers completos
IP sin política
datos personales
```

---

## 24. Observabilidad

### 24.1. Logs técnicos

Registrar:

```text id="yvyty3"
wordpress.publicTenant.resolved
wordpress.publicTenant.notFound
wordpress.publicEndpoint.cacheHit
wordpress.publicEndpoint.cacheMiss
wordpress.origin.denied
wordpress.integration.updated
```

No registrar:

```text id="nflgi4"
payload completo
headers completos
tokens
cookies
datos personales
datos financieros
```

---

### 24.2. Métricas

```text id="mdkd8x"
wordpress_public_requests_total
wordpress_public_requests_denied_total
wordpress_public_request_latency_ms
wordpress_public_cache_hit_total
wordpress_public_cache_miss_total
wordpress_mapping_updates_total
```

Labels permitidos:

```text id="brsb97"
endpoint
outcome
cacheStatus
```

Labels prohibidos:

```text id="hrpyee"
tenantId
slug si genera alta cardinalidad
ipAddress
userAgent
token
```

---

## 25. Seguridad

### 25.1. Riesgos principales

| Riesgo                                 | Impacto    |
| -------------------------------------- | ---------- |
| Exponer datos financieros públicamente | Crítico    |
| Exponer datos personales públicamente  | Crítico    |
| Mezclar tenants por slug incorrecto    | Crítico    |
| CORS abierto                           | Alto       |
| Enumeración de tenants                 | Alto       |
| Abuso de endpoints públicos            | Medio/alto |
| Cachear datos privados                 | Crítico    |
| WordPress accede a DB Core             | Crítico    |
| Mapping mal configurado                | Alto       |
| URLs internas expuestas                | Medio      |
| Logs con datos sensibles               | Alto       |

---

### 25.2. Controles

```text id="yjs9st"
public DTOs
field allowlist
tenant slug validation
isPublicVisible check
tenant active check
CORS allowlist
rate limiting
cache headers seguros
no DB direct access
no private data in public endpoints
audit mapping changes
safe logging
OpenAPI public-safe
```

---

## 26. Testing

### 26.1. Unit tests

Probar:

* slug validation;
* public DTO mapping;
* field allowlist;
* public visibility rules;
* CORS policy;
* cache policy;
* permission policy para mapping.

---

### 26.2. Integration tests

Probar:

* resolver tenant activo;
* tenant suspendido no se expone;
* tenant inactivo no se expone;
* mapping WordPress;
* public profile;
* public announcements;
* public common areas.

---

### 26.3. API tests

Probar:

* endpoints públicos;
* endpoints administrativos;
* CORS;
* rate limiting;
* cache headers;
* errores seguros.

---

### 26.4. Multitenancy tests

Probar:

* slug A no devuelve tenant B;
* announcement A no aparece en tenant B;
* common area A no aparece en tenant B;
* allowed origin por tenant.

---

### 26.5. Security tests

Probar:

* no se exponen saldos;
* no se exponen pagos;
* no se exponen nombres de residentes;
* no se exponen permisos;
* CORS no usa wildcard;
* rate limiting activo;
* no hay datos privados en cache pública.

---

## 27. Criterios de aceptación globales

La spec se considera implementada si:

* existe integración básica WordPress-Core;
* WordPress puede resolver tenant por slug;
* WordPress puede consultar perfil público;
* WordPress puede consultar branding;
* WordPress puede consultar contacto público;
* WordPress puede consultar comunicados públicos;
* WordPress puede consultar áreas comunales visibles;
* WordPress puede obtener enlaces públicos;
* los endpoints públicos no exponen datos financieros;
* los endpoints públicos no exponen datos personales;
* tenants no activos no se exponen como activos;
* CORS está restringido;
* rate limiting está activo;
* cache headers son seguros;
* mapping WordPress puede configurarse con permisos;
* cambios de mapping se auditan;
* OpenAPI documenta endpoints públicos;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas multitenant pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 28. Casos borde

| Caso                                     | Resultado esperado                     |
| ---------------------------------------- | -------------------------------------- |
| Slug inexistente                         | 404                                    |
| Tenant suspendido                        | 404 o estado público restringido       |
| Tenant inactive                          | 404                                    |
| Tenant archived                          | 404                                    |
| Slug con caracteres inválidos            | 422                                    |
| Origin no permitido                      | CORS denied                            |
| Endpoint público con rate limit excedido | 429                                    |
| Comunicado privado                       | no aparece                             |
| Comunicado draft                         | no aparece                             |
| Área comunal no visible                  | no aparece                             |
| WordPress solicita campo financiero      | no existe en DTO                       |
| WordPress solicita tenantId interno      | no se entrega si no es public-safe     |
| Cache vencido                            | reconsulta Core                        |
| Core no disponible                       | WordPress usa fallback local si existe |
| Mapping duplicado                        | 409                                    |
| allowedOrigin inválido                   | 422                                    |

---

## 29. Dependencias hacia specs futuras

Este módulo habilita:

```text id="bebrsm"
00X-resident-portal
00X-keycloak-sso
00X-wordpress-plugin
00X-public-announcements
00X-common-area-public-catalog
00X-reservations-wordpress
00X-cache-invalidation
00X-webhooks-wordpress
00X-graphql-public-api
```

---

## 30. Archivos derivados esperados

```text id="zz12c7"
docs/specs/009-wordpress-integration-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 31. Preguntas abiertas

1. ¿El slug oficial será siempre el mismo en WordPress y Core?
2. ¿Se permitirá que WordPress mantenga datos ACF como fallback?
3. ¿El branding se administrará en WordPress, en Core o en ambos durante el MVP?
4. ¿Cuál será la fuente oficial de logo/banner: WordPress Media Library o Core storage?
5. ¿Se expondrán comunicados desde Core o seguirán inicialmente en WordPress?
6. ¿Se expondrán áreas comunales desde Core en MVP o solo enlaces?
7. ¿El portal de residentes será una app separada del WordPress?
8. ¿Se usará Keycloak para login futuro desde WordPress?
9. ¿Se implementará plugin WordPress propio o integración en plantilla?
10. ¿Qué TTL de caché se usará para endpoints públicos?
11. ¿Se permitirá acceso desde subdominios por tenant?
12. ¿Se usará API key para llamadas servidor-servidor desde WordPress?
13. ¿Cómo se invalidará caché de LiteSpeed cuando cambie información pública?
14. ¿Se debe registrar auditoría de cada consulta pública o solo anomalías?
15. ¿Qué campos de ACF se conservarán como fuente local?

---

## 32. Decisión inicial para MVP

Para MVP se recomienda:

```text id="sge6jz"
- Usar REST, no GraphQL.
- Resolver tenant por slug.
- Mantener WordPress como capa visual pública.
- Mantener RESIDENT Core como fuente transaccional.
- Exponer solo endpoints public-safe.
- No exponer datos financieros.
- No exponer datos personales.
- No implementar login desde WordPress todavía.
- No implementar pagos desde WordPress.
- No implementar reservas desde WordPress.
- No implementar plugin avanzado todavía.
- Permitir fallback local ACF en WordPress.
- Usar CORS restringido.
- Usar rate limiting.
- Usar cache público con TTL corto.
- Auditar cambios de mapping.
```

---

## 33. Conclusión

El módulo `009-wordpress-integration-basic` establece el puente inicial entre el portal público WordPress y RESIDENT Core.

Debe mantenerse como una integración:

```text id="b50xq3"
public-safe
read-only desde WordPress
tenant-scoped
cacheable
CORS-restricted
rate-limited
auditable para cambios de configuración
sin datos financieros
sin datos personales privados
sin acceso directo a base de datos
preparada para SSO futuro
```

No debe aceptarse una implementación que permita a WordPress leer la base de datos del Core, exponer pagos o saldos públicamente, mostrar datos personales de residentes, usar CORS abierto en producción, mezclar tenants por slug, cachear información privada o usar WordPress como fuente de verdad transaccional.
