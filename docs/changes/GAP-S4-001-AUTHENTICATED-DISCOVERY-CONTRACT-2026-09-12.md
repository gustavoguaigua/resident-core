# GAP-S4-001 — Contrato de descubrimiento autenticado para Admin Web

## 1. Estado

| Campo     | Valor                                             |
| --------- | ------------------------------------------------- |
| Gap       | `GAP-S4-001`                                      |
| Severidad | Alta                                              |
| Estado    | `OPEN`                                            |
| Fecha     | 2026-09-12                                        |
| Sprint    | 4 — Admin Web App MVP                             |
| Bloquea   | Fase 1 y toda implementación frontend autenticada |

## 2. Problema verificable

Admin Web necesita resolver, a partir de una identidad autenticada, el perfil
administrativo actual, las memberships/tenants accesibles y los permisos Core
efectivos del tenant seleccionado. El OpenAPI integrado no expone actualmente las
superficies previstas por Spec 029:

- `GET /api/v1/me`;
- `GET /api/v1/me/tenants`;
- `GET /api/v1/me/permissions` o una proyección equivalente inequívoca;
- permisos efectivos para una membership/tenant seleccionable.

`GET /api/v1/me/person` es una proyección tenant-scoped de persona y no sustituye el
perfil administrativo ni el descubrimiento de memberships. Los claims de Keycloak no
pueden suplir estas respuestas porque Core es la autoridad de identidad activa,
membership y permisos.

## 3. Contrato que debe cerrarse

El cierre debe fijar una allowlist mínima, versionada y documentada en OpenAPI que
permita:

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

## 5. Criterios de cierre

El GAP puede pasar a `CLOSED` sólo cuando el mismo incremento incluya:

- decisión contractual inequívoca y allowlist exacta;
- implementación runtime tenant-safe;
- DTOs de éxito y errores en OpenAPI;
- autorización Core y casos negativos de identidad, tenant y membership;
- pruebas de aislamiento cross-tenant, claims maliciosos y PlatformAdmin;
- gate reproducible desde estado limpio;
- actualización del manifest de Sprint 4 a Fase 1 únicamente si todo pasa.

## 6. Frontera

Este documento no implementa endpoints, Prisma, migraciones, Keycloak, OpenAPI ni
frontend. Sprint 4 permanece `NO_GO` y `currentPhase = 0` hasta integrar el cierre.
