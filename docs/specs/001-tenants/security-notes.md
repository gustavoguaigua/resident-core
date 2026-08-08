# Security Notes — Spec 001 Tenants Management

## 1. Información del documento

| Campo           | Valor                                      |
| --------------- | ------------------------------------------ |
| Proyecto        | RESIDENT Core                              |
| Spec ID         | 001                                        |
| Módulo          | Tenants Management                         |
| Documento       | Security Notes                             |
| Ruta            | `docs/specs/001-tenants/security-notes.md` |
| Versión         | 0.1                                        |
| Estado          | Borrador inicial                           |
| Fecha           | 2026-07-13                                 |
| Documento base  | `docs/specs/001-tenants/spec.md`           |
| Plan técnico    | `docs/specs/001-tenants/plan.md`           |
| Modelo de datos | `docs/specs/001-tenants/data-model.md`     |
| Contrato API    | `docs/specs/001-tenants/api-contract.md`   |
| Plan de pruebas | `docs/specs/001-tenants/test-plan.md`      |
| Tareas          | `docs/specs/001-tenants/tasks.md`          |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `001-tenants`.

El objetivo es identificar riesgos, amenazas, controles y pruebas de seguridad necesarias para proteger la administración de tenants en RESIDENT Core.

El módulo `Tenants Management` es crítico porque define la frontera primaria de aislamiento de datos del sistema.

Regla principal:

```text
Si un tenant está mal aislado, todo el sistema multitenant queda comprometido.
```

---

## 3. Alcance de seguridad

Este documento cubre:

* creación de tenants;
* actualización de tenants;
* estados operativos;
* suspensión;
* reactivación;
* archivado;
* perfil público;
* branding;
* configuración;
* mapeo WordPress;
* endpoints públicos;
* endpoints privados;
* autorización global;
* autorización tenant-scoped;
* aislamiento multitenant;
* auditoría;
* observabilidad;
* validación de entrada;
* protección de datos;
* integración futura con Keycloak;
* integración futura con n8n.

---

## 4. Activos protegidos

El módulo protege los siguientes activos:

```text
tenant.id
tenant.slug
tenant.status
tenant.profile
tenant.branding
tenant.configuration
tenant.wordpressMapping
tenant operational state
tenant audit events
tenant public profile
tenant accessUrl
```

Aunque esta spec no almacena todavía datos financieros ni residentes, un fallo en tenants puede comprometer módulos futuros como:

* usuarios;
* propiedades;
* residentes;
* alícuotas;
* pagos;
* comprobantes;
* reportes;
* auditoría;
* archivos.

---

## 5. Principio de seguridad central

```text
El tenant es una frontera de seguridad, no solo un dato administrativo.
```

Por tanto:

* ningún usuario debe modificar otro tenant sin permiso global;
* ningún endpoint público debe exponer datos internos;
* ningún tenant suspendido o archivado debe operar normalmente;
* ninguna operación crítica debe ocurrir sin auditoría;
* ninguna integración externa debe saltarse la autorización del Core.

---

## 6. Superficies de ataque

### 6.1. API privada de plataforma

Ruta:

```text
/api/v1/platform/tenants
```

Riesgos:

* creación no autorizada de tenants;
* suspensión maliciosa de tenants;
* archivado indebido;
* modificación de configuración;
* escalamiento de privilegios;
* bypass de permisos globales.

---

### 6.2. API privada de tenant activo

Ruta:

```text
/api/v1/tenant
```

Riesgos:

* TenantAdmin modifica tenant ajeno;
* usuario sin permiso cambia branding;
* usuario sin permiso cambia configuración;
* usuario cambia WordPress mapping para redirigir a sitio malicioso;
* usuario cambia accessUrl;
* usuario activa flags no permitidos.

---

### 6.3. API pública

Ruta:

```text
/api/v1/public/tenants/{slug}
```

Riesgos:

* exposición de datos internos;
* enumeración de tenants;
* exposición de tenants suspendidos;
* exposición de tenants archivados;
* abuso por scraping;
* CORS mal configurado;
* respuestas de error demasiado descriptivas.

---

### 6.4. WordPress

Riesgos:

* WordPress interpreta datos públicos como fuente transaccional;
* WordPress consume endpoints privados;
* WordPress muestra accessUrl manipulada;
* WordPress almacena datos financieros del Core;
* WordPress depende de slug desactualizado.

---

### 6.5. n8n futuro

Riesgos:

* service account con permisos excesivos;
* modificación de tenants mediante workflow inseguro;
* webhooks sin firma;
* ejecución repetida;
* exposición de datos en historial de ejecuciones;
* acceso directo a PostgreSQL.

---

### 6.6. Keycloak futuro

Riesgos:

* creer que token válido equivale a permiso;
* confiar en roles de Keycloak para permisos financieros o tenant-scoped;
* aceptar issuer incorrecto;
* aceptar audience incorrecta;
* no vincular `sub` con `UserProfile`;
* no validar membership del tenant.

---

## 7. Datos públicos y no públicos

### 7.1. Datos públicos permitidos

El endpoint público puede exponer:

```text
slug
displayName
slogan
description
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
contact.email
contact.phone
contact.whatsapp
contact.address
contact.city
contact.province
contact.country
accessUrl
```

---

### 7.2. Datos no públicos

El endpoint público no debe exponer:

```text
tenant internal id
planCode
status interno detallado
suspendedAt
suspendedBy
suspensionReason
archivedAt
archivedBy
configuration flags internos
wordpressConjuntoId
roles
permissions
users
memberships
audit
financial data
resident data
payment data
receipt data
bank data
internal timestamps if unnecessary
```

---

### 7.3. Regla de DTO público

El endpoint público debe usar siempre un DTO específico:

```text
PublicTenantProfileResponseDto
```

Está prohibido retornar directamente la entidad `Tenant` o el resultado completo de Prisma.

---

## 8. Amenazas principales

## 8.1. Cross-tenant modification

### Descripción

Un usuario de Tenant A intenta modificar datos de Tenant B.

### Impacto

Crítico.

### Ejemplo

```text
TenantAdmin de Villa Club intenta modificar branding de Altos del Norte.
```

### Controles

* `TenantGuard`;
* `TenantPermissionGuard`;
* validación de tenant activo;
* permisos tenant-scoped;
* pruebas multitenant;
* auditoría de intentos denegados si aplica.

### Pruebas asociadas

```text
MT-001 a MT-006
AUTH-TEN-004
```

---

## 8.2. Public data exposure

### Descripción

El endpoint público devuelve más información de la necesaria.

### Impacto

Alto.

### Ejemplo

```text
GET /api/v1/public/tenants/villa-club
```

devuelve `tenant.id`, `planCode`, `configuration`, `status`, `audit`.

### Controles

* DTO público;
* contract tests;
* security tests;
* revisión OpenAPI;
* no retornar entidades internas.

### Pruebas asociadas

```text
API-PUBLIC-010 a API-PUBLIC-016
CONTRACT-WP-003
SEC-PUBLIC-001
```

---

## 8.3. Unauthorized tenant creation

### Descripción

Usuario no autorizado crea tenants.

### Impacto

Alto.

### Controles

* `AuthGuard`;
* `PlatformPermissionGuard`;
* permiso `platform.tenants.create`;
* branch de auditoría;
* logs de seguridad.

### Pruebas asociadas

```text
AUTH-PLAT-001 a AUTH-PLAT-004
API-CREATE-010
API-CREATE-011
```

---

## 8.4. Unauthorized suspension or archive

### Descripción

Usuario no autorizado suspende o archiva un tenant.

### Impacto

Crítico.

### Controles

* permisos globales específicos;
* endpoint separado;
* motivo requerido;
* auditoría;
* eventos;
* pruebas negativas.

### Permisos

```text
platform.tenants.suspend
platform.tenants.archive
```

### Pruebas asociadas

```text
API-SUSP-006
API-ARCH-004
AUTH-PLAT-006
```

---

## 8.5. Slug collision or slug manipulation

### Descripción

Dos tenants usan el mismo slug o un slug malicioso.

### Impacto

Medio-alto.

### Controles

* constraint unique;
* validación regex;
* slugs reservados;
* normalización;
* pruebas de concurrencia;
* auditoría si cambia.

### Pruebas asociadas

```text
UT-SLUG-001 a UT-SLUG-012
INT-DB-006
CONC-001
```

---

## 8.6. Tenant enumeration

### Descripción

Un atacante usa el endpoint público para descubrir tenants existentes.

### Impacto

Medio.

### Controles

* rate limiting;
* respuestas 404 uniformes;
* no exponer tenants no activos;
* no incluir metadata innecesaria;
* logs de abuso;
* posible protección en gateway.

### Pruebas asociadas

```text
API-PUBLIC-002
API-PUBLIC-004 a API-PUBLIC-007
SEC-PUBLIC-003
```

---

## 8.7. Malicious URL injection

### Descripción

Un usuario configura URLs inseguras en logo, banner, WordPress site o accessUrl.

### Impacto

Alto.

### Ejemplos

```text
javascript:alert(1)
file:///etc/passwd
http://internal-service
http://localhost:8080/admin
```

### Controles

* validar URL;
* exigir HTTPS en producción;
* bloquear esquemas no permitidos;
* bloquear localhost/private ranges en producción si aplica;
* no renderizar HTML;
* sanitización frontend futura.

### Pruebas asociadas

```text
SEC-URL-001 a SEC-URL-006
API-BRAND-UPD-003
API-WP-UPD-002
```

---

## 8.8. CORS misconfiguration

### Descripción

Endpoints autenticados permiten cualquier origen.

### Impacto

Alto.

### Control

Prohibido en producción para endpoints autenticados:

```text
Access-Control-Allow-Origin: *
```

### Permitido para endpoint público

Solo orígenes autorizados o política pública controlada.

Origen inicial:

```text
https://www.resident.gustavoguaigua.com
```

### Pruebas asociadas

```text
SEC-PUBLIC-004
CONTRACT-WP-008
```

---

## 8.9. Logs with sensitive data

### Descripción

Logs contienen tokens, headers completos o payloads sensibles.

### Impacto

Alto.

### Controles

* sanitización;
* no registrar Authorization;
* no registrar cookies completas;
* no registrar payload completo innecesario;
* traceId sin secrets.

### Pruebas asociadas

```text
SEC-LOG-001 a SEC-LOG-004
OBS-007
```

---

## 8.10. Status transition abuse

### Descripción

Un usuario cambia estado del tenant usando PATCH genérico o transición inválida.

### Impacto

Alto.

### Controles

* no permitir `status` en `PATCH /platform/tenants/{tenantId}`;
* endpoints explícitos para estado;
* `TenantStatusService`;
* permisos específicos;
* auditoría.

### Pruebas asociadas

```text
API-UPD-003
UT-STATUS-001 a UT-STATUS-012
APP-ACT
APP-SUSP
APP-REACT
APP-ARCH
```

---

## 8.11. Accidental physical deletion

### Descripción

El sistema elimina físicamente un tenant.

### Impacto

Crítico.

### Controles

* no endpoint DELETE;
* `onDelete: Restrict`;
* archivado lógico;
* migration tests;
* revisión Prisma;
* revisión PR.

### Pruebas asociadas

```text
INT-DB-011
APP-ARCH-005
MIG-008
```

---

## 8.12. WordPress used as source of truth

### Descripción

WordPress se usa para decidir acceso, estado o datos operativos del tenant.

### Impacto

Alto.

### Controles

* WordPress solo consume perfil público;
* Core es fuente de verdad;
* mapeo por slug;
* no DB compartida;
* no endpoints privados desde WordPress sin integración formal.

### Pruebas asociadas

```text
CONTRACT-WP-001 a CONTRACT-WP-008
```

---

## 9. Controles obligatorios por endpoint

## 9.1. `GET /api/v1/platform/tenants`

Controles:

* autenticación;
* permiso `platform.tenants.read`;
* paginación;
* límites de `pageSize`;
* validación de filtros;
* no exposición de secretos;
* logs con traceId.

---

## 9.2. `POST /api/v1/platform/tenants`

Controles:

* autenticación;
* permiso `platform.tenants.create`;
* validación estricta;
* slug único;
* transacción;
* auditoría;
* evento;
* no datos reales en seeds;
* no roles completos hasta spec 002.

---

## 9.3. `PATCH /api/v1/platform/tenants/{tenantId}`

Controles:

* autenticación;
* permiso `platform.tenants.update`;
* no permitir cambio de status;
* validación de campos;
* auditoría;
* no modificación de campos sensibles indirectos.

---

## 9.4. `POST /activate`

Controles:

* permiso `platform.tenants.activate`;
* estado permitido;
* configuración mínima;
* roles base placeholder;
* auditoría;
* evento.

---

## 9.5. `POST /suspend`

Controles:

* permiso `platform.tenants.suspend`;
* motivo obligatorio;
* estado permitido;
* auditoría;
* evento;
* bloqueo de operaciones ordinarias futuras.

---

## 9.6. `POST /reactivate`

Controles:

* permiso `platform.tenants.reactivate`;
* estado permitido;
* no permitir archived por defecto;
* auditoría;
* evento.

---

## 9.7. `POST /archive`

Controles:

* permiso `platform.tenants.archive`;
* estado permitido;
* no eliminación física;
* auditoría;
* evento;
* retención.

---

## 9.8. `GET /api/v1/tenant/profile`

Controles:

* autenticación;
* tenant activo;
* permiso `tenants.profile.read`;
* membership futura;
* no cross-tenant.

---

## 9.9. `PATCH /api/v1/tenant/profile`

Controles:

* autenticación;
* tenant activo;
* permiso `tenants.profile.update`;
* validación;
* auditoría;
* no cross-tenant.

---

## 9.10. `PATCH /api/v1/tenant/branding`

Controles:

* permiso `tenants.branding.update`;
* validación de URL;
* validación de color;
* HTTPS en producción;
* auditoría;
* no cross-tenant.

---

## 9.11. `PATCH /api/v1/tenant/configuration`

Controles:

* permiso `tenants.configuration.update`;
* validar flags;
* no activar módulos no disponibles sin control;
* validar moneda;
* validar timezone;
* auditoría.

---

## 9.12. `PATCH /api/v1/tenant/wordpress-mapping`

Controles:

* permiso `tenants.wordpress.update`;
* validar URLs;
* validar slug;
* no permitir redirect malicioso;
* auditoría;
* no cross-tenant.

---

## 9.13. `GET /api/v1/public/tenants/{slug}`

Controles:

* no auth;
* rate limiting;
* slug válido;
* solo tenant `active`;
* DTO público;
* no datos internos;
* CORS controlado;
* error 404 uniforme;
* métricas de acceso.

---

## 10. Autenticación

### 10.1. MVP

Durante MVP, los endpoints privados pueden usar autenticación propia temporal o mock controlado en tests.

Aun así, deben diseñarse como si el token viniera de Keycloak.

---

### 10.2. Arquitectura objetivo

```text
Keycloak autentica.
RESIDENT Core autoriza.
```

El módulo tenants no debe:

* guardar contraseñas;
* validar passwords;
* emitir tokens;
* asumir que un rol de Keycloak equivale a permiso de negocio;
* guardar secretos de Keycloak.

---

## 11. Autorización

### 11.1. Principio

```text
Token válido no equivale a operación autorizada.
```

### 11.2. Permisos globales

```text
platform.tenants.create
platform.tenants.read
platform.tenants.update
platform.tenants.activate
platform.tenants.suspend
platform.tenants.reactivate
platform.tenants.archive
```

### 11.3. Permisos tenant-scoped

```text
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

### 11.4. Reglas

* PlatformAdmin puede operar globalmente.
* TenantAdmin solo puede operar su tenant.
* TenantAdmin no puede suspender, reactivar ni archivar tenants.
* TenantUser ordinario no puede modificar configuración.
* WordPress no autoriza.
* n8n no opera sin service account.

---

## 12. Multitenancy

### 12.1. Regla principal

```text
Todo acceso tenant-scoped debe validar tenant activo y membership.
```

### 12.2. Validaciones obligatorias

Para endpoints `/api/v1/tenant/*`:

1. Usuario autenticado.
2. Tenant activo resuelto.
3. Usuario pertenece al tenant.
4. Usuario tiene permiso.
5. Operación afecta solo a ese tenant.
6. Auditoría registra tenant correcto.

---

## 13. Validación de entrada

### 13.1. Slug

Regex:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Longitud:

```text
min: 3
max: 80
```

Reservados:

```text
admin
api
auth
login
logout
platform
system
public
resident
www
app
dashboard
core
support
help
billing
settings
```

---

### 13.2. URLs

Permitido:

```text
https://...
```

Solo en local/dev controlado:

```text
http://localhost
```

Prohibido:

```text
javascript:
file:
data:
ftp:
http://localhost en producción
http://127.0.0.1 en producción
http://10.0.0.0/8 en producción
http://172.16.0.0/12 en producción
http://192.168.0.0/16 en producción
```

---

### 13.3. Colores

Regex:

```text
^#[0-9A-Fa-f]{6}$
```

---

### 13.4. Currency

MVP:

```text
USD
```

---

### 13.5. Timezone

Default:

```text
America/Guayaquil
```

Debe validarse contra timezones conocidas.

---

## 14. Auditoría

### 14.1. Eventos obligatorios

```text
tenant.created
tenant.updated
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
tenant.profile.updated
tenant.branding.updated
tenant.configuration.updated
tenant.wordpressMapping.updated
tenant.baseRoles.created
```

---

### 14.2. Campos mínimos

```text
tenantId
actorUserId
action
resourceType
resourceId
oldValue
newValue
result
reason
traceId
occurredAt
```

---

### 14.3. Operaciones críticas

Las siguientes operaciones son críticas:

```text
create tenant
activate tenant
suspend tenant
reactivate tenant
archive tenant
change slug
update wordpress mapping
update configuration
```

Deben generar auditoría siempre.

---

## 15. Observabilidad segura

### 15.1. Logs permitidos

```text
traceId
tenantId
actorUserId
action
result
latencyMs
errorCode
```

---

### 15.2. Logs prohibidos

```text
Authorization header
access token
refresh token
cookies completas
client secrets
API keys
payload completo innecesario
stack trace en producción
```

---

### 15.3. Métricas

Permitidas:

```text
tenants_created_total
tenants_activated_total
tenants_suspended_total
tenants_reactivated_total
tenants_archived_total
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

No usar como labels:

```text
userId
email
accessUrl
full slug list
IP completa como label principal
```

---

## 16. CORS

### 16.1. Endpoint público

Origen permitido inicial:

```text
https://www.resident.gustavoguaigua.com
```

### 16.2. Endpoints privados

Prohibido en producción:

```text
Access-Control-Allow-Origin: *
```

### 16.3. Regla

CORS debe definirse por ambiente y no por lógica improvisada dentro de cada controlador.

---

## 17. Rate limiting

### 17.1. Obligatorio

```text
GET /api/v1/public/tenants/{slug}
```

### 17.2. Recomendado

```text
POST /api/v1/platform/tenants
POST /api/v1/platform/tenants/{tenantId}/suspend
POST /api/v1/platform/tenants/{tenantId}/archive
```

### 17.3. Objetivo

* reducir abuso;
* limitar enumeración de slugs;
* proteger endpoint público;
* proteger operaciones administrativas.

---

## 18. Seguridad de WordPress mapping

### 18.1. Riesgos

* accessUrl malicioso;
* wordpressSiteUrl falso;
* slug WordPress incorrecto;
* redirección a phishing;
* exposición de datos públicos manipulados.

### 18.2. Controles

* validar HTTPS;
* validar dominio permitido si aplica;
* auditar cambios;
* restringir permiso `tenants.wordpress.update`;
* contract test;
* no usar WordPress para autorización.

---

## 19. Seguridad de estados del tenant

### 19.1. `pendingSetup`

Riesgo:

* exponer públicamente tenant incompleto.

Control:

```text
No exponer en endpoint público.
```

---

### 19.2. `active`

Riesgo:

* operación normal sin controles posteriores.

Control:

```text
Cada módulo futuro debe validar tenant active antes de operar.
```

---

### 19.3. `suspended`

Riesgo:

* tenant suspendido sigue operando.

Control:

```text
Bloquear operaciones ordinarias.
```

---

### 19.4. `archived`

Riesgo:

* tenant archivado reactivado indebidamente.

Control:

```text
No permitir archived → active salvo proceso especial.
```

---

## 20. Seguridad de migración

### 20.1. Riesgos

* cascades peligrosos;
* constraints ausentes;
* slug no unique;
* tabla secundaria sin `tenant_id`;
* defaults incorrectos.

### 20.2. Controles

* revisar SQL;
* usar `onDelete: Restrict`;
* migration tests;
* unique constraints;
* índices;
* no DELETE endpoint.

---

## 21. Seguridad de seeds

Los seeds deben usar datos ficticios.

Prohibido:

```text
datos reales de residentes
correos personales reales
teléfonos personales reales
cédulas
comprobantes
tokens
secrets
contraseñas reales
```

Permitido:

```text
example.com
datos demo
nombres ficticios de tenants
```

---

## 22. Integración futura con n8n

n8n no debe:

* acceder directo a PostgreSQL;
* modificar tenants sin service account;
* usar credenciales humanas;
* operar sin auditoría;
* conservar payloads sensibles innecesarios.

Si n8n actúa sobre tenants, debe usar:

```text
service account
scope mínimo
tenant explícito
firma de webhook si aplica
idempotencia si aplica
auditoría
```

---

## 23. Integración futura con Keycloak

Cuando Keycloak esté activo:

La API debe validar:

```text
issuer
audience
signature
expiration
subject
client
```

Pero además el Core debe validar:

```text
UserProfile local
membership
tenant activo
role
permission
resource ownership
```

No se debe confiar en claims de tenant sensibles dentro del token como única fuente de autorización.

---

## 24. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text
- endpoint público no expone datos internos;
- tenant suspended no se expone públicamente;
- tenant archived no se expone públicamente;
- TenantAdmin A no modifica Tenant B;
- usuario sin permiso recibe 403;
- sin token recibe 401;
- slug inválido recibe 422;
- slug duplicado recibe 409;
- URL maliciosa recibe 422;
- color inválido recibe 422;
- status no cambia por PATCH genérico;
- suspensión sin motivo falla;
- auditoría se genera;
- logs no contienen tokens.
```

---

## 25. Checklist de seguridad para PR

Antes de aprobar un PR de `001-tenants`:

```text
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints privados tienen permisos.
[ ] Endpoints tenant-scoped validan tenant activo.
[ ] TenantAdmin no puede operar tenant ajeno.
[ ] Endpoint público usa DTO específico.
[ ] Endpoint público no devuelve id interno.
[ ] Endpoint público solo expone tenants active.
[ ] Slug unique está en DB.
[ ] Slug reserved está validado.
[ ] URLs inseguras se rechazan.
[ ] CORS no está abierto en endpoints privados.
[ ] Rate limit está aplicado o planificado.
[ ] Operaciones críticas generan auditoría.
[ ] Eventos críticos se emiten.
[ ] Logs no contienen tokens.
[ ] No hay secrets en código.
[ ] No hay eliminación física de tenants.
[ ] Migración no usa cascade delete peligroso.
[ ] OpenAPI documenta auth/permisos.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Contract test WordPress pasa.
```

---

## 26. Errores seguros

Los errores deben ser claros, pero no revelar información innecesaria.

Ejemplo permitido:

```json
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "The requested tenant was not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

Evitar:

```text
SQL error completo
stack trace
nombres internos de tablas
detalles de infraestructura
token inválido con contenido del token
lista de tenants existentes
```

---

## 27. Política para endpoint público

Decisión MVP:

```text
Solo tenants active se exponen públicamente.
```

Por tanto:

| Estado         | Respuesta pública |
| -------------- | ----------------- |
| `active`       | 200               |
| `pendingSetup` | 404               |
| `suspended`    | 404               |
| `inactive`     | 404               |
| `archived`     | 404               |

Motivo:

* reduce exposición;
* evita publicar tenants incompletos;
* evita mostrar tenants suspendidos;
* simplifica contrato público;
* protege operación administrativa.

---

## 28. Riesgos residuales aceptados en MVP

| Riesgo                                        | Estado                 | Justificación                            |
| --------------------------------------------- | ---------------------- | ---------------------------------------- |
| Keycloak no integrado completamente           | Aceptado temporalmente | Se integra en fase identity/users        |
| Roles base reales diferidos                   | Aceptado temporalmente | Se implementan en `002-users-roles`      |
| Rate limit puede iniciar en gateway o backend | Aceptado con control   | Debe existir antes de producción pública |
| No hay alias de slug                          | Aceptado               | No necesario en MVP                      |
| No hay dominios personalizados                | Aceptado               | No necesario en MVP                      |
| No hay anti-abuso avanzado                    | Aceptado               | Puede agregarse con gateway/WAF futuro   |

---

## 29. Pendientes de seguridad para specs futuras

### 29.1. `002-users-roles`

Debe definir:

* UserProfile;
* roles;
* permisos;
* memberships;
* invitaciones;
* relación con Keycloak;
* MFA futuro;
* service accounts.

### 29.2. `007-audit`

Debe definir:

* tabla audit_logs;
* retención;
* inmutabilidad;
* consulta segura;
* exportación;
* permisos.

### 29.3. `008-wordpress-integration`

Debe definir:

* consumo desde WordPress;
* cache público;
* CORS;
* validación de origen;
* sincronización si aplica.

### 29.4. Specs financieras

Deben validar siempre:

```text
tenant active
tenant_id
authorization
audit
idempotency
no cross-tenant
```

---

## 30. Criterios de aceptación de seguridad

La spec `001-tenants` cumple seguridad si:

* ningún endpoint privado funciona sin autenticación;
* ningún endpoint privado permite operación sin permiso;
* TenantAdmin no puede operar tenant ajeno;
* endpoint público solo muestra tenants active;
* endpoint público no expone campos internos;
* slug está validado y es único;
* URLs peligrosas son rechazadas;
* CORS está controlado;
* operaciones críticas generan auditoría;
* logs no contienen tokens;
* no hay eliminación física de tenants;
* migración usa `onDelete: Restrict`;
* tests de seguridad pasan;
* tests multitenant pasan;
* contract test WordPress pasa.

---

## 31. Decisión final de seguridad

El módulo `001-tenants` será tratado como módulo crítico de seguridad porque define la frontera multitenant de RESIDENT Core.

La seguridad del módulo se basa en:

```text
autenticación en endpoints privados
autorización por permisos
validación de tenant activo
aislamiento multitenant
DTO público limitado
auditoría obligatoria
eventos de dominio
validación estricta
rate limiting
CORS controlado
no eliminación física
logs sanitizados
pruebas de seguridad
```

La implementación no será aceptada si permite modificación cross-tenant, expone datos internos por el endpoint público, omite auditoría en operaciones críticas o permite eliminación física ordinaria de tenants.
