# ADR-006 — Identity Provider Strategy: Keycloak as Target Identity Provider v0.1

## 1. Decisión
```text
Keycloak será el Identity Provider objetivo de RESIDENT Core antes de migrar a microservicios físicos.
```

Durante MVP se permite auth propia temporal si acelera el desarrollo y permite migración limpia.

## 2. Separación
Keycloak: autenticación, login, credenciales, sesiones, refresh tokens, password reset, MFA, SSO, identity brokering, tokens OIDC/OAuth2.

Core: tenants, memberships, roles de negocio, permisos funcionales, autorización por recurso, auditoría funcional, reglas financieras y trazabilidad.

## 3. Fases
MVP: auth propia temporal permitida. Antes de producción real con varios tenants: recomendado Keycloak. Antes de microservicios físicos: Keycloak obligatorio.

## 4. Justificación
Keycloak centraliza autenticación, evita login duplicado, soporta OIDC/OAuth2, prepara SSO, facilita MFA, proveedores externos, microservicios y reduce deuda de seguridad.

## 5. Realms
No realm por conjunto en MVP. Usar realm principal `resident`.

## 6. Clients
Iniciales: resident-admin-web, resident-resident-web, resident-api, resident-wordpress, resident-n8n. Futuros: mobile, payments-service, reports-service, notifications-service, audit-service, files-service.

## 7. Roles y autorización
Keycloak puede tener roles técnicos generales. Roles funcionales por tenant se gestionan en Core. Keycloak no reemplaza autorización de negocio; Core valida tenant, membership, rol, permiso, recurso y reglas.

## 8. Claims
Permitidos: sub, email, preferred_username, name, roles mínimos, iss, aud, exp, iat. Evitar saldos, deudas, comprobantes, datos sensibles o permisos financieros extensos.

## 9. UserProfile
```text
UserProfile(id,keycloakSubjectId,email,displayName,status,timestamps)
```

## 10. WordPress/n8n
WordPress tenant page → Acceso Residentes → Keycloak Login → Core Dashboard. n8n usa client técnico/service account con permisos mínimos.

## 11. Microservicios
Cada servicio valida issuer, audience, firma, expiración, subject, autorización de negocio, tenant isolation y auditoría. No implementan login propio.

## 12. Migración
Agregar keycloakSubjectId, levantar Keycloak, crear realm, crear clients, migrar usuarios, vincular UserProfile con subject, mover login a Keycloak, validar tokens en Core, desactivar refresh propios y auditar.

## 13. Seguridad operacional
MFA para admins, backups, actualizaciones, redirect URIs exactas, web origins restringidos, rotación de secretos, monitoreo, mappers revisados y no claims sensibles.

## 14. Criterios
Realm `resident`, clients iniciales, API valida tokens, Core mantiene keycloakSubjectId, membership y roles funcionales siguen en Core, WordPress redirige, n8n usa client técnico, MFA planificado/activo y pruebas OIDC.

## 15. Decisión final
Keycloak es proveedor objetivo. Auth propia queda como transición. Antes de microservicios físicos, Keycloak deberá estar implementado. Core conserva autorización de negocio y reglas por recurso.
