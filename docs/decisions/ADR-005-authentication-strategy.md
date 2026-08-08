# ADR-005 — Authentication Strategy: Evolutionary Authentication with Keycloak Target v0.2

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
Si usuario tiene varios tenants, selecciona tenant activo. Core valida membership aunque token sea Keycloak.

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

## 12. Decisión final
Auth propia en NestJS solo como transición. Keycloak será proveedor central antes de microservicios. Core conserva membership, roles funcionales, permisos, autorización por recurso, auditoría y reglas financieras.
