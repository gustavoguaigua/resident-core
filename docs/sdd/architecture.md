# RESIDENT Core — Architecture v0.2

## 1. Información
Ruta: `docs/sdd/architecture.md`  
Versión: 0.2  
Cambio: Keycloak como componente objetivo de identidad antes de microservicios.

## 2. Decisión arquitectónica inicial
```text
Backend modular monolith + API-first + PostgreSQL + Redis + Docker + Keycloak objetivo
```

## 3. Stack tecnológico
| Capa | Tecnología |
|---|---|
| Backend | NestJS + TypeScript |
| Runtime | Node.js LTS |
| DB | PostgreSQL |
| ORM | Prisma |
| Cache/colas | Redis |
| Jobs | BullMQ o equivalente |
| Identidad objetivo | Keycloak |
| API docs | OpenAPI / Swagger |
| Autorización | RBAC/permissions por tenant en Core |
| Testing | Jest + integración |
| Automatización | n8n |
| Storage | S3-compatible |
| Contenedores | Docker / Docker Compose |

## 4. Arquitectura lógica
```text
WordPress Portal
      │
      │ link / tenant hint / public API
      ▼
Keycloak Identity Provider objetivo
      │
      │ OIDC/OAuth2 access token
      ▼
RESIDENT Core API
      ├── Platform
      ├── Tenants
      ├── Identity Integration
      ├── Access Control
      ├── Residents & Properties
      ├── Financial
      ├── Payments
      ├── Reports
      └── Audit
      ├── PostgreSQL
      ├── Redis
      └── File Storage
```

## 5. Capas
Interface, Application, Domain e Infrastructure. Controladores no contienen reglas de negocio.

## 6. Módulos
platform, tenants, identity-integration, access-control, residents-properties, financial, payments, reconciliation, reservations, fines, meetings, communications, reports, audit, integrations.

## 7. Identity Integration
Valida tokens, mapea `sub` de Keycloak a UserProfile, soporta auth temporal propia, transición a Keycloak y configuración OIDC.

## 8. Access Control
Gestiona memberships, roles por tenant, permisos funcionales, validaciones por recurso, políticas financieras y pruebas cross-tenant.

## 9. Multitenancy
Single database + shared schema + tenant_id obligatorio. Keycloak no tendrá realm por tenant en MVP; los tenants de negocio viven en Core.

## 10. Identidad
Keycloak objetivo para login, password reset, MFA, refresh tokens y SSO. Core para membership, roles funcionales, permisos, autorización y auditoría.

## 11. Base de datos
PostgreSQL con Prisma, tenant_id, Decimal, transacciones ACID, migraciones versionadas, auditoría y preparación para `keycloakSubjectId`.

## 12. API
REST v1. Durante MVP `/auth/*` puede ser propio; con Keycloak se externaliza login y Core valida Bearer tokens OIDC.

## 13. WordPress
WordPress tenant page → `/login?tenant=villa-club` → Keycloak Login → Core Dashboard. WordPress pasa pista de tenant, no autoriza.

## 14. n8n
n8n consume APIs Core. Con Keycloak usa service account/client credentials. No accede a PostgreSQL ni modifica saldos.

## 15. Infraestructura local
resident-api, resident-worker, postgres, redis, minio, mailhog. En modo Keycloak: keycloak, keycloak-postgres.

## 16. CI/CD y pruebas
Pipeline con install, lint, typecheck, tests, multitenant tests, build, docker build y security checks. Pruebas de tokens Keycloak, audience, issuer, expiración y autorización posterior.

## 17. Observabilidad
Logs con timestamp, traceId, tenantId, userProfileId o keycloakSubjectId, acción y resultado. No tokens ni secretos.

## 18. Microservicios futuros
Antes de extraer servicios: Keycloak implementado, validación OIDC, tenant y permisos de negocio, contratos, gateway y observabilidad distribuida.

## 19. Conclusión
Core inicia modular y monolítico. Keycloak será IdP objetivo antes de microservicios; autorización de negocio permanece en Core.
