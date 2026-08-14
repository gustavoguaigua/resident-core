# RESIDENT Core — Security Architecture v0.3

## 1. Información
Ruta: `docs/sdd/security.md`  
Versión: 0.3
Cambio: baseline operativo OIDC/PKCE y validación fail-closed de Keycloak.

## 2. Propósito
Proteger datos personales, aislar tenants, proteger finanzas, prevenir accesos indebidos, mantener trazabilidad y preparar Keycloak.

## 3. Baseline
OWASP ASVS nivel objetivo 2, OWASP API Security Top 10, OWASP Top 10, buenas prácticas OAuth2/OIDC, privacidad desde el diseño y normativa ecuatoriana aplicable.

## 4. Amenazas
Acceso cross-tenant, escalamiento, robo de token, token mal validado, Keycloak mal configurado, manipulación de pagos, archivos maliciosos, secretos en Git, logs con datos personales, n8n con permisos excesivos y código IA inseguro.

## 5. Autenticación
La autorización histórica de auth propia temporal terminó antes de Sprint 2. Keycloak
es el único IdP autorizado; Core no emite access o refresh tokens propios.

Con Keycloak: frontends públicos usan Authorization Code + PKCE S256; Core valida
RS256, firma/JWKS, issuer exacto, audience `resident-api`, `azp`, tipo Bearer,
expiración, subject, email verificado, estado local, membership, permisos y recurso.
Implicit Flow y Direct Access Grants están prohibidos.

## 6. Autorización
Keycloak autentica. Core autoriza tenant, membership, rol, permiso, recurso, estado y reglas financieras.

## 7. Aislamiento multitenant
tenant_id, membership, repositorios tenant-aware, filtros, pruebas cross-tenant, cache/storage/jobs/eventos/auditoría por tenant.

## 8. Finanzas
Movimientos financieros inmutables históricamente. Correcciones con reversos o ajustes. Usar transacciones, idempotencia, auditoría y Decimal.

## 9. APIs y archivos
HTTPS, Bearer token, validación token propio/Keycloak, autorización por recurso, validación estricta, rate limiting, errores seguros, idempotencia y OpenAPI. Archivos en storage privado, separados por tenant.

### 9.1. Health endpoints

`GET /api/v1/health` puede ser público únicamente como liveness mínima y no puede
revelar dependencias o información interna. `GET /api/v1/health/details` es
platform-scoped y, fuera de local, requiere exposición interna y una identidad
autorizada con `platform.health.read`. El detalle nunca expone hosts, puertos, credenciales, queries,
stack traces, configuración, secretos ni datos de tenant o usuario.

## 10. Keycloak
Realm `resident`, no realm por tenant, redirects/origins exactos, audience mapper para
`resident-api`, access tokens de cinco minutos, refresh rotation, no claims sensibles,
JWKS cacheado con actualización controlada y service account de sólo consulta para
identidades. Secrets, users y passwords no se versionan. HTTPS, MFA para admins,
backup, rotación y dominios exactos son obligatorios antes de producción.

## 11. DB y logs
DB con mínimos privilegios, no pública, migraciones revisadas y backups. Logs con tenantId, userProfileId, keycloakSubjectId, acción, recurso, resultado y traceId; nunca contraseñas, tokens o secretos.

Para endpoints tenant-scoped, `X-Tenant-Id` es obligatorio pero nunca autoritativo.
Core revalida en cada solicitud el `UserProfile`, tenant, membership, roles, permisos y
ownership; ausencia o formato inválido fallan antes de acceder al dominio. Tenant
inexistente, inactivo o sin membership usa una denegación indistinguible para evitar
enumeración. Está prohibido seleccionar contexto mediante query/body o registrar el
header como tenant validado antes de completar esas comprobaciones.

## 12. WordPress/n8n
WordPress no autentica ni maneja pagos. n8n usa APIs Core, credenciales mínimas y service account limitada si Keycloak.

## 13. IA
No usar datos reales, no crear bypass auth, no desactivar tenant validation, no proponer auth propia permanente, no tratar Keycloak como autorización financiera.

## 14. Pruebas
Token inválido/expirado, issuer/audience incorrectos, acceso sin permiso, otro tenant, mass assignment, rate limit, archivos, reversos y permisos por recurso.

## 15. Criterios
No aceptar funcionalidad sin tenant, permisos, pruebas, auditoría crítica o que contradiga ADR-006.

## 16. Conclusión
Keycloak es el IdP de Sprint 2; Core conserva autorización de negocio, multitenancy,
auditoría financiera y reglas por recurso.
