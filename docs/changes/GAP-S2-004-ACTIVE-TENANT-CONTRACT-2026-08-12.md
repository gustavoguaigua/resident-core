# GAP-S2-004 — Contrato de tenant activo

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-004` |
| Fecha | 2026-08-12 |
| Estado | `closed` |
| Alcance | Selección, transporte y resolución del tenant activo |
| Specs afectadas | 001 — Tenants; 002 — Users and Roles |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Problema resuelto

Las fuentes proponían tres contratos incompatibles: `/auth/switch-tenant`,
`/me/switch-tenant` y un `tenantId` opcional en query. Ninguno fijaba una autoridad
única, y persistir una selección en sesión podía mezclar el contexto entre pestañas o
dispositivos. Tampoco se había decidido si Core debía emitir un segundo token junto al
access token de Keycloak.

## 3. Decisión

El tenant activo es contexto inmutable de una solicitud, no estado de autenticación.
En todo endpoint tenant-scoped el cliente envía:

```http
Authorization: Bearer <keycloak-access-token>
X-Tenant-Id: <tenant-uuid>
```

`X-Tenant-Id` es únicamente un selector no confiable. No prueba acceso ni transporta
permisos. Core es la única autoridad: en cada solicitud valida token, `UserProfile`,
tenant, estado del tenant, membership, roles, permisos y pertenencia del recurso antes
de construir un `TenantContext` request-scoped.

Se retiran del contrato `/auth/switch-tenant`, `/api/v1/me/switch-tenant` y
`tenantId` en query o body como mecanismo de selección. La interfaz cambia de tenant
localmente tras consultar `GET /api/v1/me/tenants`; la siguiente solicitud lleva el
nuevo header.

## 4. Persistencia, expiración y concurrencia

- Core no persiste un “tenant activo” en PostgreSQL, Redis, cookie ni sesión.
- Core no emite un tenant token ni añade `tenantId` al token de Keycloak.
- El contexto vive solamente durante la solicitud y termina con ella.
- La expiración de autenticación sigue siendo la del access token de Keycloak.
- Tenant y membership se revalidan en cada solicitud; suspensión o revocación surten
  efecto en la siguiente solicitud.
- Distintas pestañas o dispositivos pueden operar tenants diferentes sin compartir
  estado mutable en servidor.
- Una cache de autorización, si se incorpora, se indexa al menos por subject,
  `tenantId` y versión de autorización; nunca sustituye la validación autoritativa y se
  invalida ante cambios de tenant, usuario, membership, roles o permisos.

## 5. Clasificación de endpoints

| Clase | `X-Tenant-Id` | Regla |
| --- | --- | --- |
| Tenant-scoped (`/api/v1/tenant/**`, `/api/v1/me/permissions`) | Obligatorio | Core resuelve y valida `TenantContext` |
| Autenticado de descubrimiento (`/api/v1/me`, `/api/v1/me/tenants`) | No requerido | El header no concede alcance ni altera la respuesta |
| Platform-scoped (`/api/v1/platform/**`) | No requerido | El alcance proviene del permiso global; un `tenantId` de path identifica el recurso, no al actor |
| Público, auth callback y health | No requerido | No se crea `TenantContext` |
| Jobs y eventos internos | No aplica | Llevan `tenantId` explícito dentro de un contrato interno autenticado |

Los endpoints tenant-scoped no aceptan `tenantId` en query o body. Un identificador de
tenant puede aparecer en el path de una operación global de plataforma o en contratos
internos porque allí identifica el recurso; nunca reemplaza la autorización.

## 6. Validación y errores

Orden mínimo para una solicitud tenant-scoped:

1. validar Bearer token y resolver el subject;
2. resolver un `UserProfile` activo;
3. exigir exactamente un `X-Tenant-Id` UUID bien formado;
4. cargar un tenant `active` y una membership `active` para el perfil;
5. resolver roles y permisos efectivos para ese mismo tenant;
6. fijar un `TenantContext` inmutable en la solicitud;
7. filtrar persistencia y ownership por el `tenantId` resuelto.

Errores canónicos:

| Condición | HTTP | Código |
| --- | --- | --- |
| Header ausente | 400 | `TENANT_CONTEXT_REQUIRED` |
| Header repetido o UUID malformado | 400 | `TENANT_CONTEXT_INVALID` |
| Tenant inexistente/inactivo o membership inexistente/inactiva | 403 | `TENANT_ACCESS_DENIED` |
| Permiso insuficiente | 403 | `ACCESS_DENIED` |
| `tenantId` prohibido en query/body | 422 | `TENANT_CONTEXT_CONFLICT` |

`TENANT_ACCESS_DENIED` no distingue tenant inexistente, suspendido, archivado o sin
membership para evitar enumeración. La respuesta usa el envelope de error estándar y
no devuelve detalles internos.

## 7. Seguridad, CORS, auditoría y OpenAPI

- CORS debe permitir `Authorization`, `Content-Type`, `X-Tenant-Id` y los headers
  explícitamente aprobados; nunca se usa origen abierto en producción.
- Logs y auditoría toman `tenantId` del `TenantContext` validado, no directamente del
  header; no registran access tokens.
- OpenAPI marca endpoints tenant-scoped con header requerido y
  `x-tenant-scope: tenant`; los endpoints de descubrimiento/plataforma no lo heredan.
- Las pruebas negativas cubren ausencia, duplicidad y formato del header, membership
  revocada, tenant inactivo, recursos cross-tenant y `tenantId` inyectado en body/query.

## 8. Contratos rechazados

- `/auth/switch-tenant`: mezcla selección de negocio con autenticación del IdP.
- `/me/switch-tenant`: exige estado mutable o un segundo token sin aportar autoridad.
- `tenantId` libre u opcional en query/body: permite contratos ambiguos y facilita
  confused deputy.
- Tenant fijo en token Keycloak: impide concurrencia segura entre tenants y exige
  reemisión del token por una decisión que pertenece a Core.

## 9. Consecuencia para readiness

`GAP-S2-004` queda cerrado documentalmente. No se implementan headers, guards,
endpoints ni persistencia en este cambio. La compuerta mantiene `NO_GO`: permanecen
abiertos dos gaps críticos y tres altos, además de la aprobación documental requerida.

