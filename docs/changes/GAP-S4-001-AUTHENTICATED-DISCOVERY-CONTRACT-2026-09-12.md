# GAP-S4-001 — Contrato de descubrimiento autenticado para Admin Web

## 1. Estado

| Campo     | Valor                                             |
| --------- | ------------------------------------------------- |
| Gap       | `GAP-S4-001`                                      |
| Severidad | Alta                                              |
| Estado    | `CLOSED`                                          |
| Fecha     | 2026-09-12                                        |
| Sprint    | 4 — Admin Web App MVP                             |
| Bloquea   | Fase 1 y toda implementación frontend autenticada |

## 2. Problema resuelto

Admin Web necesitaba resolver, desde la identidad autenticada, el perfil aplicativo,
los tenants accesibles y los permisos Core efectivos del tenant seleccionado. El
incremento incorpora exactamente:

- `GET /api/v1/me`;
- `GET /api/v1/me/tenants`;
- `GET /api/v1/me/permissions`.

`GET /api/v1/me/person` es una proyección tenant-scoped de persona y no sustituye el
perfil administrativo ni el descubrimiento de memberships. Los claims de Keycloak no
pueden suplir estas respuestas porque Core es la autoridad de identidad activa,
membership y permisos.

## 3. Contrato cerrado

La allowlist mínima, versionada y documentada en OpenAPI permite:

1. resolver el `subject` autenticado a un `UserProfile` activo sin exponer datos
   innecesarios;
2. listar exclusivamente tenants con membership activa del usuario;
3. seleccionar un tenant mediante su identificador opaco y enviar `X-Tenant-Id`;
4. obtener permisos Core efectivos para esa membership, sin derivarlos de roles o
   claims Keycloak en el navegador;
5. revalidar tenant, identidad, membership y permisos en cada request tenant-scoped;
6. responder de forma fail-closed y sin revelar tenants o memberships ajenos;
7. definir DTOs exitosos y errores canónicos suficientes para el cliente tipado.

No se requiere ni se autoriza un BFF, sesión WordPress, administración directa de
Keycloak, tenantId editable en formularios ni autorización definitiva en frontend.

## 4. Seguridad y privacidad

- El cliente Keycloak sigue siendo `resident-admin-web`, público, con Authorization
  Code Flow y PKCE S256.
- Los tokens permanecen en memoria; no se escriben en URL, logs, `localStorage` ni
  `sessionStorage`.
- El selector local no crea autoridad: `X-Tenant-Id` es validado por Core.
- `PlatformAdmin` no obtiene acceso tenant-scoped implícito.
- Claims, roles visuales y navegación sólo informan UX; el permiso Core exacto decide
  cada operación en backend.
- Las respuestas deben minimizar PII y no exponer secretos, tokens ni detalles de
  autorización interna.

## 5. Evidencia de cierre

- `/api/v1/me` devuelve sólo `userProfileId`, `displayName` y estado activo; no exige
  `X-Tenant-Id` y el header no altera la respuesta.
- `/api/v1/me/tenants` devuelve exclusivamente memberships y tenants activos,
  ordenados de forma determinista; no exige `X-Tenant-Id`.
- `/api/v1/me/permissions` exige `X-Tenant-Id` validado y devuelve permisos Core
  efectivos, deduplicados y ordenados, sin derivarlos de claims Keycloak.
- Los tres endpoints son GET autenticados, no usan ledger de idempotencia y no
  generan Audit de éxito.
- Respuestas y errores canónicos están publicados en OpenAPI; no exponen subject,
  email, roles, tokens ni detalles internos.
- El gate `test:admin-discovery` cubre migraciones desde cero, casos válidos,
  identidad/membership/tenant inactivos, aislamiento cross-tenant, claims maliciosos,
  PlatformAdmin sin acceso implícito y ausencia de Audit en lecturas exitosas.
- `currentPhase` avanza únicamente a `1`; la readiness permanece `NO_GO` por
  GAP-S4-002.

## 6. Frontera

El cierre no modifica Prisma, migraciones, Keycloak ni frontend. La selección futura
se cacheará por tenant en el cliente, pero el servidor no persiste un tenant activo.
Sprint 4 permanece `NO_GO` y `currentPhase = 1` hasta cerrar GAP-S4-002.
