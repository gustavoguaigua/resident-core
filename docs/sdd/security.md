# RESIDENT Core — Security Architecture v0.2

## 1. Información
Ruta: `docs/sdd/security.md`  
Versión: 0.2  
Cambio: Keycloak como IdP objetivo y separación auth/autorización.

## 2. Propósito
Proteger datos personales, aislar tenants, proteger finanzas, prevenir accesos indebidos, mantener trazabilidad y preparar Keycloak.

## 3. Baseline
OWASP ASVS nivel objetivo 2, OWASP API Security Top 10, OWASP Top 10, buenas prácticas OAuth2/OIDC, privacidad desde el diseño y normativa ecuatoriana aplicable.

## 4. Amenazas
Acceso cross-tenant, escalamiento, robo de token, token mal validado, Keycloak mal configurado, manipulación de pagos, archivos maliciosos, secretos en Git, logs con datos personales, n8n con permisos excesivos y código IA inseguro.

## 5. Autenticación
MVP: auth propia temporal permitida. Objetivo: Keycloak como IdP central.

Si auth propia: email/password, hash fuerte, access corto, refresh revocable, sesiones, rate limiting, recuperación segura, auditoría.

Con Keycloak: validar firma, issuer, audience, expiración, subject, estado local, membership, permisos y recurso.

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
Realm `resident`, no realm por tenant en MVP, redirect URIs exactas, web origins restringidos, HTTPS, MFA para admins, backup DB, no claims sensibles, mappers revisados, rotación de secretos, service accounts limitadas.

## 11. DB y logs
DB con mínimos privilegios, no pública, migraciones revisadas y backups. Logs con tenantId, userProfileId, keycloakSubjectId, acción, recurso, resultado y traceId; nunca contraseñas, tokens o secretos.

## 12. WordPress/n8n
WordPress no autentica ni maneja pagos. n8n usa APIs Core, credenciales mínimas y service account limitada si Keycloak.

## 13. IA
No usar datos reales, no crear bypass auth, no desactivar tenant validation, no proponer auth propia permanente, no tratar Keycloak como autorización financiera.

## 14. Pruebas
Token inválido/expirado, issuer/audience incorrectos, acceso sin permiso, otro tenant, mass assignment, rate limit, archivos, reversos y permisos por recurso.

## 15. Criterios
No aceptar funcionalidad sin tenant, permisos, pruebas, auditoría crítica o que contradiga ADR-006.

## 16. Conclusión
Keycloak será IdP objetivo; Core conserva autorización de negocio, multitenancy, auditoría financiera y reglas por recurso.
