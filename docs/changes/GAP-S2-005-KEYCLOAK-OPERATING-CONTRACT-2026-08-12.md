# GAP-S2-005 — Contrato operativo y reproducible de Keycloak

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-005` |
| Fecha | 2026-08-12 |
| Última verificación | 2026-08-14 — contrato implementado en Sprint 2 Fase 1 |
| Estado | `closed` |
| Alcance | Realm, clientes, OIDC, validación Bearer, bootstrap y pruebas |
| Spec afectada | 002 — Users, Roles and Access Management |
| Versión Keycloak | `26.7.0` |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Problema resuelto

ADR-006 fijaba el realm y nombres de clientes, pero no determinaba tipos de cliente,
grants, PKCE, redirects, origins, audiences, mappers, endpoints, expiraciones,
bootstrap sintético ni manejo de identidades locales. Compose levantaba Keycloak sin
importar una configuración versionada. Tampoco resolvía que el issuer visible por el
navegador usa `localhost`, mientras la API en Docker alcanza el servicio como
`keycloak`.

Este documento cierra el contrato implementable. No incorpora todavía el realm, los
scripts ni el adaptador runtime: esas escrituras continúan bloqueadas hasta una
decisión formal `GO` para Sprint 2.

## 3. Frontera de autoridad

- Keycloak autentica, administra credenciales, sesiones, recuperación y tokens.
- Core valida el access token y conserva `UserProfile`, tenants, memberships, roles de
  negocio, permisos, estados locales, ownership y auditoría.
- Un token válido no crea automáticamente un `UserProfile`, una membership ni acceso.
- Core no almacena passwords, access tokens, refresh tokens ni secretos de clientes.
- Sprint 2 no implementa autenticación propietaria paralela, password grant, token
  exchange, impersonation, dynamic client registration ni autorización de negocio en
  Keycloak.

## 4. Artefactos reproducibles obligatorios

La implementación autorizada posteriormente debe crear exactamente:

```text
infra/keycloak/realm/resident-realm.json
infra/keycloak/fixtures/local-identities.json
tools/keycloak/bootstrap-local.mjs
tools/keycloak/verify-realm.mjs
```

El archivo `resident-realm.json` es la fuente versionada de configuración declarativa,
se monta read-only en `/opt/keycloak/data/import/resident-realm.json` y se importa al
arranque mediante `start-dev --import-realm`. Su nombre cumple la convención oficial
`<realm>-realm.json`.

La importación de arranque omite un realm existente. Por ello:

- CI siempre usa base y volumen efímeros vacíos;
- `verify-realm.mjs` compara el realm vivo con invariantes versionadas y falla ante
  drift;
- ningún comando borra volúmenes automáticamente;
- recrear el volumen exclusivo de Keycloak es una acción local explícita y confirmada;
- el export/import no se usa como sustituto de backups de producción.

El realm no contiene usuarios, passwords, admin credentials ni client secrets. El
fixture sólo declara identidades sintéticas `@example.com`; el script idempotente las
crea usando valores efímeros de entorno. Ninguna identidad real se versiona.

## 5. Realm canónico

| Propiedad | Valor Sprint 2 local/CI |
| --- | --- |
| Realm | `resident` |
| Enabled | `true` |
| Realm por tenant | Prohibido |
| Login por email | Permitido |
| Emails duplicados | Prohibidos |
| Registro público | Deshabilitado |
| Verificación de email | Requerida para identidades humanas Core |
| Reset password | Habilitado por Keycloak |
| Remember me | Deshabilitado |
| Brute force detection | Habilitada |
| Firma de access token | `RS256` |
| Access token lifespan | 300 segundos |
| Authorization code lifespan | 60 segundos |
| SSO session idle | 1.800 segundos |
| SSO session max | 36.000 segundos |
| Refresh token rotation | Requerida; reuse máximo `0` |
| Offline access | No concedido |

MFA para administradores, HTTPS, dominios públicos, SMTP real, backups y rotación
operativa son requisitos de producción, pero no se simulan ni se declaran cumplidos por
el realm local/CI. Deben cerrarse en el hardening de despliegue antes de producción.

## 6. Clientes de Sprint 2

| `client_id` | Tipo | Flujos | Propósito |
| --- | --- | --- | --- |
| `resident-admin-web` | Público OIDC | Authorization Code + PKCE S256 | Admin Web |
| `resident-resident-web` | Público OIDC | Authorization Code + PKCE S256 | Resident Web |
| `resident-api` | Resource server | Ningún grant | Audience de la API |
| `resident-identity-admin` | Confidencial/service account | Client Credentials | Consulta mínima de identidades |

### 6.1. Clientes web

Ambos clientes:

- habilitan únicamente Standard Flow;
- exigen PKCE con `code_challenge_method=S256`;
- deshabilitan Implicit Flow, Direct Access Grants, Device Flow y service accounts;
- no tienen client secret;
- solicitan `openid profile email`;
- no reciben roles, memberships ni permisos funcionales desde Keycloak;
- conservan tokens sólo en memoria; no usan `localStorage` ni `sessionStorage`;
- no usan wildcard en redirects, post-logout redirects ni web origins.

Valores locales exactos:

| Cliente | Redirect URI | Post logout | Web origin |
| --- | --- | --- | --- |
| `resident-admin-web` | `http://localhost:3001/auth/callback` | `http://localhost:3001/` | `http://localhost:3001` |
| `resident-resident-web` | `http://localhost:3002/auth/callback` | `http://localhost:3002/` | `http://localhost:3002` |

Los valores de staging/producción deben ser orígenes HTTPS exactos suministrados por el
despliegue. Como esos dominios aún no están aprobados, no forman parte del realm de
Sprint 2 y no se sustituyen por wildcards.

### 6.2. Resource server `resident-api`

No inicia login, no emite tokens, no tiene redirect URI, origin, secret ni grants. Un
client scope default `resident-api-audience`, enlazado a ambos clientes web, usa un
mapper de audience fijo para añadir `resident-api` al claim `aud` de access tokens.
No se usa el ID token como Bearer.

El mapper `resident-api-audience` es el único protocol mapper propio del realm para
Sprint 2: añade la audience sólo al access token, no al ID token ni a UserInfo. Los
scopes estándar `profile` y `email` proveen los claims OIDC informativos y
`email_verified`; no se enlazan mappers de realm roles, client roles, groups, tenants,
memberships o permisos.

### 6.3. Cliente técnico `resident-identity-admin`

- es confidencial y usa exclusivamente Client Credentials;
- su secret viene de secret storage/entorno y nunca del JSON o Git;
- no tiene redirects, origins, Direct Access Grants ni flujo interactivo;
- recibe sólo los roles mínimos `query-users` y `view-users` de `realm-management`;
- permite resolver por email una identidad existente y leer `id`, `email`, `enabled`
  y `emailVerified`;
- no crea credenciales, no administra realm/clients y no autoriza negocio;
- sus tokens y secret no se registran ni se exponen a frontends.

El bootstrap admin de Keycloak pertenece únicamente al arranque operativo local/CI.
Sus credenciales no se entregan a Core y no reemplazan este cliente mínimo.

### 6.4. Clientes diferidos

`resident-wordpress` y `resident-n8n` conservan los identificadores reservados de
ADR-006, pero no se provisionan en Sprint 2. WordPress sólo enlaza al frontend; n8n y
su service account requieren un contrato posterior. Mobile y microservicios también
quedan fuera.

## 7. Endpoints y separación de red

Para local:

```text
Public base URL: http://localhost:8080
Keycloak hostname: KC_HOSTNAME=http://localhost:8080
Issuer: http://localhost:8080/realms/resident
Discovery: http://localhost:8080/realms/resident/.well-known/openid-configuration
JWKS público: http://localhost:8080/realms/resident/protocol/openid-connect/certs
JWKS Docker: http://keycloak:8080/realms/resident/protocol/openid-connect/certs
Admin API Docker: http://keycloak:8080/admin/realms/resident
```

La API valida siempre el issuer público exacto, aunque recupere JWKS por la URL interna
de Docker. Nunca deriva el issuer desde `Host`, el token o el request recibido. La
implementación distingue al menos `KEYCLOAK_ISSUER`, `KEYCLOAK_JWKS_URL`,
`KEYCLOAK_API_AUDIENCE` y las credenciales del cliente técnico.

Compose debe fijar `KC_HOSTNAME=http://localhost:8080` para que los tokens y discovery
publiquen el issuer canónico incluso cuando la API use el backchannel Docker. El
verificador debe fallar si el issuer descubierto difiere del configurado.

En staging/producción, issuer y discovery usan una URL HTTPS canónica. El canal interno
puede resolver esa misma URL o usar un JWKS backchannel aprobado, sin relajar la
comparación de issuer ni deshabilitar TLS.

## 8. Contrato de access token

Claims obligatorios para requests humanos:

```text
iss aud sub exp iat azp typ email email_verified
```

Claims informativos permitidos:

```text
preferred_username name given_name family_name
```

Validación fail-closed, antes de resolver permisos:

1. token Bearer JWT con tres segmentos y tamaño acotado;
2. algoritmo exactamente `RS256`; se rechazan `none`, HMAC y algoritmos inesperados;
3. firma válida con una key del JWKS configurado y `kid` conocido;
4. `iss` igual al issuer configurado, sin normalización permisiva;
5. `aud` string o array que contiene `resident-api`;
6. `azp` igual a `resident-admin-web` o `resident-resident-web`;
7. `typ = Bearer`;
8. `sub` no vacío y dentro de límites;
9. `exp`, `iat` y `nbf` cuando exista, con skew máximo de 30 segundos;
10. `email_verified = true` para identidades humanas;
11. búsqueda exacta por `UserProfile.keycloakSubjectId = sub` y estado local activo;
12. autorización Core posterior, incluida membership/tenant cuando aplique.

Los roles y claims de Keycloak nunca conceden permisos funcionales. Email y nombres no
actualizan automáticamente Core ni sustituyen `sub` como vínculo estable.

JWKS se cachea con TTL acotado; ante un `kid` desconocido se permite una sola
actualización controlada. Si no existe una key válida o el cache expiró y Keycloak no
responde, se falla cerrado. No se usa introspection por request ni se acepta una key
embebida por el cliente.

## 9. Errores y estados locales

| Condición | HTTP | Código |
| --- | --- | --- |
| Bearer ausente | 401 | `AUTHENTICATION_REQUIRED` |
| Token inválido/expirado/issuer/audience/azp incorrectos | 401 | `INVALID_ACCESS_TOKEN` |
| Keycloak/JWKS no disponible sin key cacheada válida | 503 | `IDENTITY_PROVIDER_UNAVAILABLE` |
| `sub` válido sin `UserProfile` enlazado | 403 | `IDENTITY_NOT_PROVISIONED` |
| `UserProfile` deshabilitado/archivado | 403 | `USER_DISABLED` |
| Contexto tenant no autorizado | Según GAP-S2-004 | `TENANT_ACCESS_DENIED` |

Las respuestas usan el error envelope estándar, no revelan claims, URLs internas,
keys, subjects, estado de Keycloak ni existencia de emails. Un token inválido genera
auditoría sanitizada sólo con resultado, razón categorizada y traceId.

## 10. Bootstrap sintético local y CI

`local-identities.json` declara, como mínimo:

```text
platform.admin@example.com
tenant.admin@example.com
resident.user@example.com
```

Todas son sintéticas, enabled y email-verified. El script:

1. espera health/discovery del realm;
2. obtiene credenciales operativas desde entorno;
3. crea o verifica las identidades idempotentemente;
4. asigna passwords temporales sólo desde entorno local/CI;
5. no asigna roles funcionales Keycloak;
6. emite únicamente IDs/redacted status, nunca passwords o tokens;
7. falla si un email existente no coincide con los invariantes esperados.

El primer `PlatformAdmin` Core continúa creándose mediante el comando one-shot de
GAP-S2-003. El fixture Keycloak no crea roles, perfiles, memberships ni permisos Core.

## 11. Gates de implementación

La futura implementación debe comprobar:

- JSON válido, sin secretos/usuarios y compatible con Keycloak 26.7.0;
- import exitoso desde base vacía y segundo arranque idempotente;
- verificación de realm/clientes/scopes/mappers sin drift;
- discovery, issuer y JWKS esperados;
- Authorization Code + PKCE S256 positivo para ambos clientes web;
- rechazo de redirect/origin no registrado, PKCE ausente/no S256, implicit y password
  grant;
- audience `resident-api` presente sólo en access tokens previstos;
- validaciones negativas de firma, issuer, audience, `azp`, expiración, `sub`,
  email no verificado y `kid` desconocido;
- rechazo de subject sin perfil y usuario Core deshabilitado;
- cliente técnico sin permisos de escritura/admin superiores;
- escaneo de secretos y ausencia de tokens/credenciales en logs;
- ejecución desde checkout limpio en CI con servicios efímeros.

Los tests unitarios pueden usar JWT/JWKS sintéticos para claims manipulados; al menos
un flujo positivo y las invariantes de realm deben ejercitar Keycloak real. No se crea
un cliente inseguro con password grant para simplificar CI.

## 12. Consecuencia para readiness

`GAP-S2-005` cerró inicialmente el contrato documental. Después del `GO`, Sprint 2
Fase `1` implementó realm, fixtures, bootstrap, verificador y pruebas OIDC, con evidencia
en `SPRINT-2-PHASE-1-KEYCLOAK-2026-08-14.md`. La autenticación runtime y la persistencia
Core permanecen fuera de esta fase.

## 13. Referencias oficiales

- `https://www.keycloak.org/server/importExport`
- `https://www.keycloak.org/securing-apps/oidc-layers`
- `https://www.keycloak.org/docs/latest/server_admin/`
