# ADR-004 — Multitenancy Strategy: Shared Schema with Tenant Isolation v0.2

## 1. Decisión
```text
Single database + shared schema + tenant_id obligatorio + RBAC por tenant + validación backend.
```

Keycloak:
```text
Realm principal: resident.
No crear realm por conjunto en MVP.
Tenants de negocio se gestionan en Core.
```

## 2. Justificación
Shared schema reduce costo y complejidad. Realm único permite usuarios multi-tenant y evita duplicar configuración. La autorización financiera depende del dominio y queda en Core.

## 3. Resolución tenant activo
Validar token propio/Keycloak, identificar subject, mapear UserProfile, identificar tenant, validar membership, validar estado, cargar rol/permisos y ejecutar con tenant_id.

## 4. Membership y roles
UserTenantMembership contiene userProfileId, tenantId, roleId, status, invitedBy, joinedAt y timestamps. Globales: SuperAdmin, PlatformOperator, PlatformSupport. Tenant: TenantAdmin, Treasurer, BoardMember, Resident, PropertyOwner, Guard, TenantAuditor.

## 5. DB/API/cache/jobs/eventos/archivos
Toda tabla operativa tiene tenant_id. Endpoints privados no aceptan tenantId libre en body. Cache usa `tenant:{tenantId}:...`. Jobs/eventos incluyen tenantId. Archivos se separan por tenant.

## 6. Auditoría
Incluye tenantId, userProfileId, keycloakSubjectId, action, resourceType, resourceId, occurredAt, traceId y result.

## 7. WordPress
WordPress identifica tenant por slug/URL y pasa pista, pero no autoriza:
```text
WordPress tenant page → /login?tenant=villa-club → Keycloak/Core Login → Core valida membership → Dashboard
```

## 8. Testing
Usuario Tenant A intentando acceder a recurso Tenant B debe recibir denegación sin fuga de información.

## 9. Repositorios
Correcto: `findPaymentById(tenantId, paymentId)`. Evitar búsqueda solo por id salvo contexto global auditado.

## 10. Migración futura
Ruta posible: shared schema → dedicated schema → dedicated database. Requiere ADR.

## 11. Decisión final
Core adopta aislamiento lógico con tenant_id. Keycloak usará realm `resident`. La autorización por tenant sigue en Core.
