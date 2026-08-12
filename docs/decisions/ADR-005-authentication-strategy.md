# ADR-005 — Authentication Strategy: Evolutionary Authentication with Keycloak Target v0.3

## Estado

`accepted`

## Contexto

RESIDENT Core necesita autenticación segura desde el MVP sin convertir una solución
temporal en dependencia permanente. La identidad debe poder evolucionar hacia OIDC y
OAuth2 mientras Core conserva tenants, memberships y autorización de negocio.

## 1. Decisión
```text
MVP: autenticación propia temporal permitida.
Arquitectura objetivo: Keycloak como Identity Provider central.
```

Auth propia en NestJS no será permanente. Antes de microservicios físicos, Keycloak deberá estar implementado.

## 2. Responsabilidades
| Responsabilidad | MVP | Objetivo |
|---|---|---|
| Login, password, reset, access/refresh token | Core | Keycloak |
| MFA/SSO | Diferido | Keycloak |
| Tenant membership, roles funcionales, permisos, autorización, auditoría financiera | Core | Core |

## 3. Principios
Autenticación no es autorización. Usuario autenticado no accede a todos los tenants. Keycloak no sustituye reglas de negocio. WordPress no autentica Core.

## 4. Flujo MVP
Email/password, validación Core, tenants disponibles, sesión, tokens, selección de tenant y carga de permisos.

## 5. Flujo objetivo
Redirección a Keycloak, token OIDC, Core valida issuer/audience/firma/expiración, mapea sub a UserProfile, valida membership y autoriza negocio.

## 6. Tokens
MVP: JWT corto, refresh revocable, hash en DB, payload mínimo. Objetivo: token Keycloak con claims mínimos. No incluir saldos, deudas, comprobantes o permisos financieros extensos.

## 7. Tenant activo
Si un usuario tiene varios tenants, la interfaz mantiene su selección local y envía
`X-Tenant-Id` en cada solicitud tenant-scoped. El header no es autoridad: Core valida
tenant y membership en cada solicitud aunque el token sea Keycloak. La selección no se
persiste en sesión ni se incorpora al token, y Core no expone un endpoint `switch-tenant`.

## 8. Invitaciones y WordPress
Invitaciones de negocio siguen en Core. WordPress no autentica Core:
```text
WordPress tenant page → /login?tenant=villa-club → Keycloak Login → Core Dashboard
```

## 9. Base de datos
MVP temporal: user_profiles, auth_sessions, refresh_tokens, password_reset_tokens, invitations. Objetivo: user_profiles(keycloak_subject_id), memberships, roles, permissions, role_permissions, audit_logs.

## 10. Pruebas
MVP: login, rate limit, refresh, logout, password reset, tenant selection. Keycloak: token válido, expirado, issuer/audience incorrectos, firma inválida, subject sin perfil, usuario deshabilitado, membership inexistente y permisos insuficientes.

## 11. Riesgos
Auth propia permanente, token mal validado, Keycloak mal configurado, confundir auth con autorización, tenant selection insegura y WordPress como auth.

## Consecuencias

- Una implementación temporal propia debe diseñarse para migración y posterior retiro.
- Core debe separar autenticación técnica de autorización funcional desde el inicio.
- La transición requiere mapear identidades a `UserProfile` sin perder memberships ni auditoría.
- Keycloak deberá estar operativo antes de extraer microservicios físicos.

## Alternativas consideradas

- Mantener autenticación propia permanentemente: descartado por deuda de seguridad y duplicación de capacidades de identidad.
- Exigir Keycloak para toda la primera iteración: no se impone como condición absoluta del MVP, aunque sigue siendo el objetivo.
- Reutilizar sesiones de WordPress: descartado porque WordPress no autentica ni autoriza RESIDENT Core.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/api-guidelines.md`
- `docs/decisions/ADR-004-multitenancy-strategy.md`
- `docs/decisions/ADR-006-identity-provider-strategy.md`
- `docs/decisions/ADR-007-authorization-strategy.md`

## 12. Decisión final
Auth propia en NestJS solo como transición. Keycloak será proveedor central antes de microservicios. Core conserva membership, roles funcionales, permisos, autorización por recurso, auditoría y reglas financieras.
