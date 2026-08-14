# RESIDENT Core — API Guidelines v0.4

## 1. Información
Ruta: `docs/sdd/api-guidelines.md`  
Versión: 0.4
Cambio: contrato Bearer Keycloak fail-closed y tenant request-scoped.

## 2. Principios
API-first, privada por defecto, multitenancy obligatorio, contratos estables, trazabilidad e identidad desacoplada.

## 3. Estilo
REST API versionada en `/api/v1`.

## 4. Autenticación desde Sprint 2

Login, refresh y password reset pertenecen a Keycloak. Core no expone autenticación
propia ni una operación `switch-tenant` en la superficie de autenticación o `/me`.

## 5. Autenticación API
```text
Authorization: Bearer <access_token>
```
Sprint 2 adopta access token Keycloak. Validar RS256 y firma contra JWKS configurado,
issuer exacto, audience `resident-api`, `azp` permitido, `typ=Bearer`, expiración,
subject, email verificado, estado local, membership y permisos. ID tokens, algoritmos
inesperados, password grant y claims de roles como autoridad se rechazan.

## 6. Tenant resolution
Los endpoints tenant-scoped exigen `X-Tenant-Id: <tenant-uuid>`. Es un selector no
confiable por solicitud: Core lo valida contra token, `UserProfile`, tenant, membership,
rol y permisos antes de crear el contexto. No se persiste la selección, no se emite un
segundo token y no se acepta `tenantId` en query o body para seleccionar contexto.
`GET /me/tenants` descubre memberships y la UI conserva su selección local.

## 7. Autorización
Cada endpoint declara permiso. Ejemplos: `payments.read`, `payments.confirm`, `reports.financial.read`.

## 8. Endpoints principales
Tenants: `GET/POST /tenants`, `GET /public/tenants/{slug}`.  
Access: `GET /user-profiles`, `POST /users/invite`, `GET /roles`, `GET /permissions`.  
Financial: `GET /charges`, `POST /fees/generate-monthly`, `GET /payments`, `POST /payments/{id}/confirm`.

## 9. Request/response
Fechas ISO 8601, dinero decimal string, IDs UUID/no predecibles.

Las respuestas exitosas de APIs funcionales usan por defecto:

```json
{"data":{},"meta":{}}
```

`data` es obligatorio y `meta` es opcional. Los endpoints operativos
`GET /api/v1/health` y `GET /api/v1/health/details` son la única excepción inicial:
usan los payloads planos definidos en ADR-010 §10 para interoperar con probes. OpenAPI
debe marcarlos con `x-response-envelope: false` y `x-health-endpoint: true`.

La excepción solo aplica a resultados health `200` y `503`. Errores de autenticación,
autorización, routing, rate limiting o fallos no controlados usan el formato de error
estándar.

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
La API valida exclusivamente access tokens Keycloak; la autorización de negocio sigue
en Core.
