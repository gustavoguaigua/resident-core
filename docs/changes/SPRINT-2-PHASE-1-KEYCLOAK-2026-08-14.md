# Sprint 2 — Fase 1: Realm y contrato Keycloak

## Estado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-08-14 |
| Fase | `1` — `keycloak-contract` |
| Estado | `PASS` |
| Decisión de readiness | `GO` |
| Siguiente fase permitida | `2` — `tenant-identity-persistence` |

## Alcance implementado

- realm versionado `resident`, importado mediante `start-dev --import-realm`;
- clientes públicos `resident-admin-web` y `resident-resident-web` con Authorization
  Code + PKCE S256 y redirects/origins locales exactos;
- `resident-api` como resource server y audience exclusiva de access tokens humanos;
- cliente técnico `resident-identity-admin` con Client Credentials y únicamente
  `query-users`/`view-users`;
- scopes estándar mínimos `basic`, `profile` y `email`, más el único mapper propio
  `resident-api-audience`;
- fixture sintético sin passwords y bootstrap idempotente mediante variables de
  entorno;
- issuer público `http://localhost:8080/realms/resident` separado del JWKS Docker
  `http://keycloak:8080/realms/resident/protocol/openid-connect/certs`;
- import, drift, discovery, JWKS, clientes, scopes, identidades y permisos técnicos
  verificables;
- stack de pruebas efímero desde base vacía, con limpieza acotada a su proyecto.

## Evidencia

- `keycloak:verify`: `PASS` en import inicial y después de reiniciar Keycloak;
- segundo bootstrap: `PASS`, sin duplicar identidades;
- `test:keycloak`: `PASS` para ambos clientes web;
- negativas: redirect no registrado, PKCE ausente/plain, implicit, password grant,
  firma, issuer, audience, `azp`, expiración, `sub`, email no verificado y `kid`
  desconocido;
- `sprint2:boundary`: `PASS` en fase `1`;
- realm y fixtures sin usuarios, passwords, client secrets ni credenciales
  versionadas.

## Frontera

No se implementaron modelos o migraciones Prisma, autenticación runtime de la API,
resolución de `UserProfile`, memberships, autorización de negocio ni artefactos de
Fase 2. El manifest queda en `currentPhase: 1`.
