# RESIDENT Core — API Guidelines v0.2

## 1. Información
Ruta: `docs/sdd/api-guidelines.md`  
Versión: 0.2  
Cambio: Bearer token temporal propio o emitido por Keycloak en objetivo.

## 2. Principios
API-first, privada por defecto, multitenancy obligatorio, contratos estables, trazabilidad e identidad desacoplada.

## 3. Estilo
REST API versionada en `/api/v1`.

## 4. Auth temporal
Si se usa auth propia: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/switch-tenant`, `/auth/me`.

Con Keycloak, login/refresh/password reset se trasladan al IdP y Core valida tokens.

## 5. Autenticación API
```text
Authorization: Bearer <access_token>
```
MVP: token del Core. Objetivo: token Keycloak. Validar firma, expiración, issuer, audience, subject, estado local, membership y permisos.

## 6. Tenant resolution
Tenant activo se resuelve desde token, UserProfile, tenant seleccionado, membership, rol y permisos. El body no acepta tenantId libremente.

## 7. Autorización
Cada endpoint declara permiso. Ejemplos: `payments.read`, `payments.confirm`, `reports.financial.read`.

## 8. Endpoints principales
Tenants: `GET/POST /tenants`, `GET /public/tenants/{slug}`.  
Access: `GET /user-profiles`, `POST /users/invite`, `GET /roles`, `GET /permissions`.  
Financial: `GET /charges`, `POST /fees/generate-monthly`, `GET /payments`, `POST /payments/{id}/confirm`.

## 9. Request/response
Fechas ISO 8601, dinero decimal string, IDs UUID/no predecibles.

## 10. Error format
```json
{"error":{"code":"ACCESS_DENIED","message":"You are not authorized.","details":{},"traceId":"req_123456"}}
```

## 11. Paginación e idempotencia
`?page=1&pageSize=20`, máximo 100. Idempotencia para pagos, alícuotas, importaciones, webhooks, n8n y cargos masivos.

## 12. Auditoría
Auditar login, cambio de tenant, roles, alícuotas, pagos, reversos, conciliaciones, multas, reservas, exportaciones y documentos sensibles.

## 13. WordPress/n8n
WordPress consume públicos y redirige a Core/Keycloak. n8n usa APIs Core y service account con Keycloak.

## 14. OpenAPI y pruebas
Cada endpoint documenta auth, permiso, tenant, request, response, errores, auditoría e idempotencia. Pruebas: token inválido, issuer/audience, permisos, otro tenant, estado e idempotencia.

## 15. Conclusión
La API valida tokens temporales del Core o tokens Keycloak objetivo; autorización de negocio sigue en Core.
