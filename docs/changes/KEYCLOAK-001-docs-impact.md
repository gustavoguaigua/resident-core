# KEYCLOAK-001 — Impacto documental de Keycloak en RESIDENT Core

## 1. Propósito
Registrar el impacto documental de adoptar Keycloak como Identity Provider objetivo. No sustituye documentos fuente; sirve como bitácora.

## 2. Decisión
```text
Keycloak será el Identity Provider objetivo de RESIDENT Core antes de migrar a microservicios físicos.
```

## 3. Documentos actualizados
```text
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-005-authentication-strategy.md
```

Documento creado:

```text
docs/decisions/ADR-006-identity-provider-strategy.md
```

## 4. Cambios principales
Auth propia queda como transición temporal. Keycloak es arquitectura objetivo. Core conserva autorización de negocio. Se define realm `resident`. Se descarta realm por tenant en MVP. UserProfile soporta keycloakSubjectId. APIs validan Bearer tokens del Core temporalmente o Keycloak objetivo. WordPress no autentica Core. n8n usará client técnico/service account.

## 5. Estado
Los documentos fuente fueron consolidados en v0.2, excepto ADR-006 que inicia en v0.1.
