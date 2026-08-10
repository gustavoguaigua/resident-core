# RESIDENT Core — Constitución SDD v0.2

## 1. Información
Ruta: `docs/sdd/constitution.md`  
Versión: 0.2  
Estado: Borrador rector actualizado.  
Cambio: incorpora Keycloak como proveedor objetivo de identidad antes de microservicios físicos.

## 2. Propósito
RESIDENT Core es el sistema transaccional central del ecosistema RESIDENT. Automatiza procesos administrativos, financieros, operativos y comunitarios de conjuntos residenciales bajo un modelo multitenant. WordPress será portal informativo y punto de entrada; Core será fuente de verdad transaccional.

## 3. Alcance inicial
Tenants, usuarios/perfiles/membresías/roles/permisos, residentes, propietarios, unidades, alícuotas, estados de cuenta, pagos, comprobantes, movimientos bancarios, conciliación, reservas, multas, reuniones, notificaciones, reportes, auditoría, WordPress, n8n y preparación para microservicios.

## 4. Principios rectores
### 4.1. La especificación manda sobre el código
Ningún módulo crítico se implementa sin spec SDD. Cada spec incluye reglas, criterios de aceptación, modelo de datos, contratos API, pruebas, seguridad, auditoría, datos personales y relación con tenants.

### 4.2. Multitenancy desde el diseño
Cada registro operativo pertenece a un tenant. Todo endpoint sensible valida tenant, membership, permiso y recurso.

### 4.3. Modularidad antes que microservicios
La primera versión será monolito modular contenerizado. La extracción a microservicios requiere evidencia técnica y ADR.

### 4.4. Autenticación externalizable
Durante el MVP se permite autenticación propia temporal si acelera el desarrollo, pero la arquitectura objetivo debe adoptar un proveedor compatible con OpenID Connect/OAuth2.

```text
Keycloak será el Identity Provider objetivo de RESIDENT Core antes de migrar a microservicios físicos.
```

Keycloak gestionará login, credenciales, sesiones, refresh tokens, password reset, MFA, SSO, identity brokering y tokens OIDC/OAuth2. Core seguirá gestionando tenants, memberships, roles funcionales, permisos de negocio, autorización por recurso, reglas financieras, auditoría y trazabilidad.

### 4.5. Finanzas auditables
Pagos, cargos, multas, conciliaciones y movimientos financieros no se eliminan físicamente. Correcciones mediante reversos, anulaciones o ajustes auditables.

### 4.6. Seguridad desde la especificación
Cada módulo define roles, permisos, datos sensibles, validaciones, riesgos, auditoría, pruebas de acceso no autorizado, controles multitenant e impacto de identidad.

### 4.7. Protección de datos personales
Aplicar minimización, finalidad, acceso por rol/tenant, registro de cambios, protección en APIs y derechos de titulares cuando proceda.

### 4.8. API-first
Core expondrá APIs versionadas y documentadas mediante OpenAPI. WordPress puede pasar pista de tenant, pero no autorizar.

### 4.9. Pruebas obligatorias
Unitarias, integración, autorización, aislamiento multitenant, reglas de negocio, contratos API, regresión financiera y validación de tokens cuando aplique Keycloak.

### 4.10. Uso responsable de IA
La IA no aprueba código crítico, no inventa reglas, no elimina históricos, no crea bypasses de autenticación ni trata Keycloak como autorización de negocio.

## 5. Estructura oficial del repositorio
```text
resident-core/
├── apps/
│   ├── api/
│   ├── admin-web/
│   └── resident-web/
├── packages/
│   ├── shared/
│   ├── config/
│   ├── auth/
│   ├── openapi-client/
│   └── testing/
├── docs/
│   ├── sdd/
│   ├── decisions/
│   ├── specs/
│   ├── changes/
│   ├── implementation/
│   ├── consolidated/
│   └── templates/
├── infra/
│   ├── docker/
│   ├── keycloak/
│   ├── postgres/
│   └── local/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
├── tools/
│   ├── openapi/
│   ├── scripts/
│   └── ci/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── .node-version
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

No se crearán directorios de implementación alternativos en la raíz. Docker,
Keycloak y PostgreSQL se configurarán bajo `infra/`; los scripts bajo `tools/`; y
las pruebas compartidas bajo `packages/testing/`. Las pruebas específicas de cada
aplicación o paquete permanecerán junto al código que validan.

## 6. Estructura por spec
Cada módulo contiene `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `api-contract.md`, `test-plan.md` y `security-notes.md`.

## 7. Criterios generales de aceptación
Funcionalidad aceptada si tiene spec, pruebas, tenant validation, permisos, auditoría, documentación, ejecución local y compatibilidad con Keycloak.

## 8. MVP prioritario
Tenants, usuarios/perfiles/memberships/roles/permisos, residentes-propiedades, alícuotas, estados de cuenta, pagos, comprobantes, auditoría, reportes básicos e integración WordPress.

## 9. Decisiones pendientes
Momento exacto de Keycloak, despliegue, realm `resident`, clients OIDC, MFA por rol, frontend, cloud y alcance final MVP.

## 10. Definición de terminado
Compila, prueba, cumple criterios, respeta multitenancy, permisos, auditoría, documentación y ADR-006.

## 11. Regla final
La velocidad no puede estar por encima de consistencia, seguridad, trazabilidad, protección de datos y confiabilidad.
