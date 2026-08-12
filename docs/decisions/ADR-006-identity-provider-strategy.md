# ADR-006 — Identity Provider Strategy: Keycloak as Target Identity Provider v0.2

## Estado

`accepted`

## Contexto

La arquitectura objetivo necesita un proveedor OIDC/OAuth2 central para login,
sesiones, recuperación, MFA y SSO, sin trasladar a ese proveedor la autorización
multitenant ni las reglas funcionales y financieras de RESIDENT Core.

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
Identificadores iniciales canónicos:

| Consumidor | `client_id` |
| --- | --- |
| Admin Web App | `resident-admin-web` |
| Resident Web App (`apps/resident-web`) | `resident-resident-web` |
| RESIDENT Core API | `resident-api` |
| WordPress | `resident-wordpress` |
| n8n | `resident-n8n` |

El nombre de aplicación `resident-web` no debe utilizarse como `client_id`; el cliente
OIDC del frontend residente es siempre `resident-resident-web`. Clientes futuros:
mobile, payments-service, reports-service, notifications-service, audit-service y
files-service.

## 7. Roles y autorización
Keycloak puede tener roles técnicos generales. Roles funcionales por tenant se gestionan en Core. Keycloak no reemplaza autorización de negocio; Core valida tenant, membership, rol, permiso, recurso y reglas.

## 8. Claims
Permitidos: sub, email, preferred_username, name, roles mínimos, iss, aud, exp, iat. Evitar saldos, deudas, comprobantes, datos sensibles o permisos financieros extensos.

## 9. UserProfile
```text
UserProfile(id,keycloakSubjectId,email,displayName,status,timestamps)
```

### 9.1. Bootstrap de identidades administrativas

La identidad del primer PlatformAdmin y del TenantAdmin inicial debe existir,
estar habilitada y tener email verificado en Keycloak antes de escribir en Core.
Core recibe email, resuelve el subject canónico mediante un adaptador interno y
rechaza cualquier subject impuesto desde un DTO público. Keycloak no participa
en la transacción PostgreSQL y Core no crea ni almacena sus credenciales.

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

## Consecuencias

- Keycloak se convierte en la fuente objetivo de identidad técnica y Core conserva autorización de negocio.
- Deben operarse realm, clients, mappers, redirect URIs, secretos, actualizaciones y respaldos de Keycloak.
- Los frontends y clientes técnicos deberán adoptar flujos OIDC/OAuth2 apropiados.
- La migración desde autenticación propia requiere vincular de forma segura cada `UserProfile` con su subject externo.

## Alternativas consideradas

- Identity Provider propio permanente: descartado por costo, riesgo y duplicación de capacidades maduras.
- Realm separado por tenant: descartado para el MVP por complejidad y por dificultar usuarios multi-tenant.
- Proveedor de identidad administrado: no adoptado como baseline; puede evaluarse mediante un nuevo ADR si cambian requisitos operativos o económicos.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-004-multitenancy-strategy.md`
- `docs/decisions/ADR-005-authentication-strategy.md`
- `docs/decisions/ADR-007-authorization-strategy.md`

## 15. Decisión final
Keycloak es proveedor objetivo. Auth propia queda como transición. Antes de microservicios físicos, Keycloak deberá estar implementado. Core conserva autorización de negocio y reglas por recurso.
