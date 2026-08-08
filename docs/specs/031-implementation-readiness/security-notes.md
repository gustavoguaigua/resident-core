# Security Notes — 031 Implementation Readiness

## 1. Información del documento

| Campo      | Valor                                                                |
| ---------- | -------------------------------------------------------------------- |
| Proyecto   | RESIDENT Core                                                        |
| Spec ID    | 031                                                                  |
| Módulo     | Implementation Readiness                                             |
| Documento  | Security Notes                                                       |
| Ruta       | `docs/specs/031-implementation-readiness/security-notes.md`          |
| Versión    | 0.1                                                                  |
| Estado     | Borrador inicial                                                     |
| Fecha      | 2026-08-06                                                           |
| Naturaleza | Security readiness gate / Pre-implementation control / Platform-only |
| Alcance    | Validación previa a implementación técnica                           |

---

## 2. Propósito

Definir los controles de seguridad que deben cumplirse antes de iniciar la implementación técnica de RESIDENT Core.

Este documento no protege una funcionalidad transaccional específica, sino el paso crítico entre especificación SDD e implementación. Su función es impedir que el desarrollo arranque con vacíos de seguridad, arquitectura, multitenancy, autenticación, autorización, auditoría, contratos API, manejo documental, CI/CD o separación WordPress/Core.

Regla central:

```text id="ir-sec-rule"
Implementation Readiness no debe permitir el inicio de implementación productiva si existen gaps críticos de seguridad, multitenancy, autenticación, autorización, auditoría, OpenAPI, manejo de datos, storageKey exposure, WordPress transaccional, rutas públicas privadas, pagos sin trazabilidad, documentos sin SDS, frontends sin contratos, ausencia de CI mínimo o contradicciones entre ADRs, documentos SDD y specs funcionales.
```

---

## 3. Clasificación de seguridad

```text id="ir-sec-classification"
Platform security gate
Pre-implementation control
Documentation security checkpoint
Architecture consistency checkpoint
Non-tenant-facing
Non-resident-facing
Non-transactional
Internal-only
Security-critical
Audit-required
No public exposure
No WordPress dependency
No business data exposure
```

---

## 4. Activos protegidos

```text id="ir-sec-assets"
- documentación SDD base;
- ADRs;
- specs 001-030;
- contratos API;
- modelos de datos;
- security-notes por módulo;
- test-plans;
- tasks;
- decisiones Go / Conditional Go / No-Go;
- matriz de readiness;
- registro de gaps;
- criterios de implementación;
- estructura de repositorio;
- estrategia multitenant;
- estrategia Keycloak;
- estrategia OpenAPI;
- estrategia PostgreSQL/Prisma;
- estrategia CI/CD;
- límites WordPress/Core;
- decisiones de seguridad previas al código.
```

---

## 5. Principios de seguridad

```text id="ir-sec-principles"
1. No iniciar código sin readiness.
2. No iniciar código con gaps críticos abiertos.
3. No implementar módulos MVP sin security-notes.
4. No implementar módulos MVP sin api-contract.
5. No implementar módulos MVP sin test-plan.
6. No implementar pagos sin auditoría.
7. No implementar documentos sin Secure Document Storage.
8. No implementar frontend sin OpenAPI.
9. No usar WordPress como backend transaccional.
10. No permitir rutas públicas administrativas.
11. No permitir rutas públicas resident-facing transaccionales.
12. No permitir storageKey en APIs o UI.
13. No permitir secretos en repositorio.
14. No permitir tokens en logs.
15. No permitir datos reales a IA externa.
16. No permitir multitenancy ambiguo.
17. No permitir autorización dependiente solo del frontend.
18. No permitir roles Keycloak como única autorización de negocio.
19. No permitir CI/CD ausente para código productivo.
20. No permitir migraciones sin validación.
```

---

## 6. Amenazas principales

### 6.1. Inicio prematuro de implementación

Riesgo:

```text id="ir-sec-threat-premature-code"
El equipo inicia desarrollo antes de cerrar decisiones críticas, produciendo código inconsistente, inseguro o difícil de corregir.
```

Controles:

```text id="ir-sec-control-premature-code"
- Definition of Ready global.
- Go / Conditional Go / No-Go.
- Registro de gaps.
- Bloqueo de gaps críticos.
- Revisión de ADRs.
- Revisión de paquetes MVP.
```

---

### 6.2. Contradicciones arquitectónicas

Riesgo:

```text id="ir-sec-threat-architecture"
Los documentos SDD, ADRs y specs definen decisiones incompatibles entre sí.
```

Controles:

```text id="ir-sec-control-architecture"
- Matriz de consistencia.
- Revisión cruzada architecture.md vs ADRs.
- Revisión cruzada security.md vs security-notes.
- Revisión cruzada api-guidelines.md vs api-contract.md.
- Revisión cruzada data-governance.md vs data-model.md.
```

---

### 6.3. Multitenancy insuficiente

Riesgo:

```text id="ir-sec-threat-multitenancy"
La implementación arranca sin una estrategia clara de aislamiento por tenant.
```

Controles:

```text id="ir-sec-control-multitenancy"
- ADR-004 obligatorio.
- tenant_id obligatorio en entidades tenant-scoped.
- TenantGuard requerido.
- Tests multitenant obligatorios.
- Prohibición de tenantId editable como autoridad final.
- Índices tenant-scoped.
- Auditoría tenant-scoped.
```

---

### 6.4. Autenticación y autorización incompletas

Riesgo:

```text id="ir-sec-threat-auth"
El sistema implementa autenticación o autorización incompleta, dejando endpoints expuestos o permisos inconsistentes.
```

Controles:

```text id="ir-sec-control-auth"
- Keycloak como IdP objetivo.
- Authorization Code Flow with PKCE para frontends.
- Core autoriza reglas de negocio.
- PermissionGuard obligatorio.
- Resource-level authorization.
- Property-level authorization para self-service.
- Revisión de permisos por módulo.
```

---

### 6.5. WordPress usado indebidamente

Riesgo:

```text id="ir-sec-threat-wordpress"
WordPress se convierte accidentalmente en backend transaccional o proxy inseguro.
```

Controles:

```text id="ir-sec-control-wordpress"
- WordPress solo como portal público informativo.
- No sesión WordPress para Core.
- No wp-admin como consola Core.
- No formularios públicos para pagos, documentos, visitantes o estados de cuenta.
- No endpoints privados embebidos públicamente.
- CORS restrictivo.
```

---

### 6.6. Exposición de storageKey o documentos

Riesgo:

```text id="ir-sec-threat-storage"
APIs o frontends exponen storageKey, signedUrl persistente o documentos privados.
```

Controles:

```text id="ir-sec-control-storage"
- SDS obligatorio para comprobantes y documentos.
- secureDocumentId como única referencia externa.
- No storageKey en DTOs.
- No signedUrl persistente.
- Contract tests de OpenAPI.
- Security static checks.
```

---

### 6.7. Pagos sin trazabilidad

Riesgo:

```text id="ir-sec-threat-payments"
Pagos, comprobantes o saldos se implementan sin auditoría o reglas financieras claras.
```

Controles:

```text id="ir-sec-control-payments"
- 005-payments con audit obligatorio.
- 006-account-statements derivados de cargos y pagos.
- No saldos calculados por frontend.
- No aprobación de pagos en self-service.
- No conciliación automática sin módulo autorizado.
- No asientos contables directos fuera de 020.
```

---

## 7. Gaps críticos bloqueantes

No se puede emitir estado `GO` si existe cualquiera de estos gaps:

```text id="ir-sec-critical-gaps"
- Falta constitution.md.
- Falta architecture.md.
- Falta security.md.
- Falta api-guidelines.md.
- Falta data-governance.md.
- Falta ADR de arquitectura.
- Falta ADR de base de datos.
- Falta ADR de multitenancy.
- Falta ADR de autenticación.
- Falta ADR de Keycloak.
- Falta ADR de autorización.
- Falta ADR de testing.
- Falta ADR de CI/CD.
- Paquete MVP sin spec.md.
- Paquete MVP sin data-model.md.
- Paquete MVP sin api-contract.md.
- Paquete MVP sin test-plan.md.
- Paquete MVP sin security-notes.md.
- Estrategia multitenant ambigua.
- Keycloak no reflejado en docs relevantes.
- Autorización tenant-aware no definida.
- Property-level authorization no definida para resident self-service.
- Pagos sin auditoría.
- Estados de cuenta como fuente primaria independiente.
- Documentos o comprobantes fuera de SDS.
- storageKey expuesto.
- WordPress usado como backend transaccional.
- Rutas públicas administrativas.
- Rutas públicas resident-facing transaccionales.
- OpenAPI no definido.
- Frontends sin cliente OpenAPI.
- CI mínimo inexistente.
- Tests multitenant inexistentes.
- Tests de permisos inexistentes.
- Tests de seguridad inexistentes.
```

---

## 8. Gaps de alto riesgo

Pueden permitir `CONDITIONAL_GO` únicamente si tienen mitigación, owner y fecha objetivo:

```text id="ir-sec-high-gaps"
- UI secundaria incompleta.
- Reportes avanzados diferidos.
- Observabilidad avanzada diferida.
- Dashboard avanzado diferido.
- Integración de pasarela real diferida.
- Open banking diferido.
- Bank reconciliation diferido.
- Accounting ledger diferido.
- Supplier payments diferido.
- Hardware de accesos diferido.
- Automatizaciones productivas diferidas.
- Data import avanzada diferida.
```

Regla:

```text id="ir-sec-high-gap-rule"
Un gap de alto riesgo no puede ignorarse. Debe registrarse con decisión: resolve-before-MVP, resolve-before-production, defer, requires-ADR o accepted-risk temporal.
```

---

## 9. Reglas Go / Conditional Go / No-Go

### 9.1. GO

```text id="ir-sec-go"
Se permite GO si:
[ ] No hay gaps críticos abiertos.
[ ] No hay gaps altos sin decisión.
[ ] MVP core tiene documentos completos.
[ ] ADRs críticos están alineados.
[ ] Multitenancy está definido.
[ ] Keycloak está definido.
[ ] OpenAPI está definido.
[ ] Seguridad base está definida.
[ ] CI mínimo está definido.
[ ] Tests críticos están definidos.
```

---

### 9.2. CONDITIONAL_GO

```text id="ir-sec-conditional-go"
Se permite CONDITIONAL_GO si:
[ ] No hay gaps críticos en Sprint 0-2.
[ ] Los gaps restantes son no bloqueantes.
[ ] Los gaps restantes tienen owner.
[ ] Los gaps restantes tienen mitigación.
[ ] Los gaps restantes tienen requiredBefore.
[ ] El código inicial no compromete arquitectura, seguridad ni datos.
```

---

### 9.3. NO_GO

```text id="ir-sec-no-go"
Debe emitirse NO_GO si:
[ ] Hay gaps críticos abiertos.
[ ] Multitenancy está indefinido.
[ ] Keycloak/autorización está indefinido.
[ ] OpenAPI está indefinido.
[ ] WordPress aparece como backend transaccional.
[ ] storageKey aparece en API o UI.
[ ] Pagos carecen de auditoría.
[ ] Frontends consumen endpoints improvisados.
[ ] No existe CI mínimo.
[ ] Hay contradicciones graves entre ADRs y specs.
```

---

## 10. Seguridad documental

Reglas:

```text id="ir-sec-document-rules"
- Cada documento SDD debe tener ruta clara.
- Cada paquete crítico debe tener security-notes.
- Cada contrato API debe declarar endpoints prohibidos.
- Cada data-model debe declarar campos prohibidos.
- Cada test-plan debe incluir pruebas de seguridad.
- Cada tasks.md debe incluir gates de seguridad.
- Los documentos consolidados no reemplazan los documentos fuente.
- Las modificaciones estructurales deben registrarse en changes/.
```

Prohibido:

```text id="ir-sec-document-forbidden"
- iniciar implementación con documentos inconsistentes;
- usar documentos consolidados como única fuente oficial;
- ignorar ADRs vigentes;
- copiar specs incompletas como aprobadas;
- omitir security-notes en módulos de pagos, documentos, usuarios o frontends;
- omitir api-contract en módulos frontend-facing.
```

---

## 11. Seguridad del repositorio

Controles mínimos:

```text id="ir-sec-repository-controls"
- Monorepo con separación apps/packages/docs/infra.
- .env.example sin secretos.
- .gitignore para .env reales.
- Secret scanning.
- No credenciales en README.
- No tokens en documentación.
- No claves privadas en repositorio.
- No dumps de base de datos reales.
- No comprobantes reales.
- No documentos de residentes reales.
- No datos personales reales para pruebas.
```

Estructura segura esperada:

```text id="ir-sec-repository-structure"
resident-core/
├── apps/
│   ├── api/
│   ├── admin-web/
│   └── resident-web/
├── packages/
├── docs/
├── infra/
├── prisma/
├── tools/
└── .github/
```

---

## 12. Seguridad de ambientes

### 12.1. Local development

```text id="ir-sec-local-env"
- Usar datos ficticios.
- Usar tenants de prueba.
- Usar usuarios de prueba.
- Usar comprobantes ficticios.
- Usar documentos ficticios.
- Usar Keycloak local.
- Usar PostgreSQL local.
- Usar Redis local.
- No usar datos reales de residentes.
- No conectar pasarelas reales.
- No conectar open banking real.
```

---

### 12.2. Staging

```text id="ir-sec-staging-env"
- Datos anonimizados o sintéticos.
- Variables protegidas.
- CORS restringido.
- Logging sanitizado.
- Acceso limitado.
- No exposición pública accidental.
- No WordPress público como proxy transaccional.
```

---

### 12.3. Producción futura

```text id="ir-sec-prod-env"
- HTTPS obligatorio.
- Secrets manager obligatorio.
- Backups cifrados.
- Monitoreo.
- Alertas.
- Rate limiting.
- Auditoría.
- Hardening Keycloak.
- Revisión de seguridad previa.
```

---

## 13. Seguridad Keycloak readiness

Antes de iniciar implementación:

```text id="ir-sec-keycloak-readiness"
[ ] Realm definido.
[ ] Client API definido.
[ ] Client admin-web definido.
[ ] Client resident-web definido.
[ ] Authorization Code Flow with PKCE definido.
[ ] Implicit flow deshabilitado.
[ ] Mapping keycloakSubjectId -> UserProfile definido.
[ ] Logout definido.
[ ] Token validation definida.
[ ] No sesión WordPress.
[ ] Roles Keycloak no reemplazan permisos Core.
[ ] Core conserva autorización tenant-aware.
```

Bloqueante si:

```text id="ir-sec-keycloak-blockers"
- no se sabe cómo mapear usuario Keycloak a UserProfile;
- roles Keycloak se usan como única autorización;
- no existe validación de token;
- frontends usan implicit flow;
- WordPress autentica operaciones Core.
```

---

## 14. Seguridad multitenant readiness

Antes de iniciar implementación:

```text id="ir-sec-multitenant-readiness"
[ ] tenant_id definido para entidades tenant-scoped.
[ ] TenantGuard definido.
[ ] Tenant resolver definido.
[ ] Membership resolver definido.
[ ] Cross-tenant access policy definida.
[ ] Índices tenant-scoped definidos.
[ ] Auditoría tenant-scoped definida.
[ ] Tests multitenant definidos.
```

Bloqueante si:

```text id="ir-sec-multitenant-blockers"
- entidad crítica carece de tenant_id;
- API acepta tenantId como autoridad final;
- queries pueden ejecutarse sin tenant filter;
- frontend cachea datos sin tenant boundary;
- auditoría no registra tenant.
```

---

## 15. Seguridad OpenAPI readiness

Antes de iniciar implementación:

```text id="ir-sec-openapi-readiness"
[ ] /api/v1 definido.
[ ] Bearer auth definido.
[ ] Response envelope definido.
[ ] Error envelope definido.
[ ] x-auth-required definido.
[ ] x-tenant-scope definido.
[ ] x-public-exposure definido.
[ ] x-storage-key-exposed=false donde aplique.
[ ] Cliente admin-web generable.
[ ] Cliente resident-web generable.
[ ] Contract tests definidos.
```

Bloqueante si:

```text id="ir-sec-openapi-blockers"
- frontend consume endpoints no documentados;
- storageKey aparece en DTOs externos;
- api-contract falta en paquete MVP;
- OpenAPI no declara seguridad;
- endpoints públicos transaccionales existen.
```

---

## 16. Seguridad CI/CD readiness

Pipeline mínimo:

```text id="ir-sec-cicd-minimum"
[ ] TypeScript check.
[ ] Lint check.
[ ] Format check.
[ ] Unit tests.
[ ] Integration tests iniciales.
[ ] OpenAPI generation.
[ ] Prisma migration check.
[ ] Docker build.
[ ] Secret scanning.
[ ] Security static checks.
```

Debe fallar si:

```text id="ir-sec-cicd-fail"
- se detectan secretos;
- se detectan database URLs en frontend;
- se detecta Prisma en frontend;
- se detecta storageKey en DTO público;
- se detecta endpoint público transaccional;
- se detecta WordPress auth para Core;
- se rompe OpenAPI client generation;
- fallan tests multitenant;
- fallan tests de permisos;
- fallan tests de seguridad críticos.
```

---

## 17. Seguridad de datos de prueba

Permitido:

```text id="ir-sec-test-data-allowed"
- tenants ficticios;
- usuarios ficticios;
- unidades ficticias;
- cargos ficticios;
- pagos ficticios;
- comprobantes ficticios;
- documentos ficticios;
- visitantes ficticios;
- datos anonimizados.
```

Prohibido:

```text id="ir-sec-test-data-forbidden"
- datos reales de residentes;
- cédulas reales;
- teléfonos reales sin autorización;
- correos reales no autorizados;
- comprobantes reales;
- estados de cuenta reales;
- documentos privados reales;
- claves reales;
- tokens reales;
- dumps reales de producción;
- imágenes biométricas;
- datos bancarios reales.
```

---

## 18. Seguridad de IA y automatización

Reglas:

```text id="ir-sec-ai-rules"
- IA puede apoyar documentación, código ficticio y análisis arquitectónico.
- IA no debe recibir datos reales de residentes.
- IA no debe recibir comprobantes reales.
- IA no debe recibir estados de cuenta reales.
- IA no debe recibir secretos.
- IA no debe recibir tokens.
- IA no debe recibir backups.
- Automatizaciones n8n no deben procesar datos sensibles reales en MVP sin revisión.
```

Bloqueante si:

```text id="ir-sec-ai-blockers"
- se planea enviar datos reales a IA externa;
- se planea procesar comprobantes reales con IA sin ADR;
- se planea usar n8n como canal productivo sensible sin security-notes;
- se planea automatización que modifica pagos, conciliaciones o asientos sin autorización formal.
```

---

## 19. Seguridad de WordPress/Core

Reglas:

```text id="ir-sec-wordpress-rules"
- WordPress es portal público informativo.
- Core es fuente transaccional.
- WordPress no autentica usuarios Core.
- WordPress no almacena tokens Core.
- WordPress no muestra estados de cuenta privados.
- WordPress no recibe comprobantes privados.
- WordPress no registra visitantes privados.
- WordPress no actúa como admin-web.
- WordPress no actúa como resident-web.
```

Bloqueante si:

```text id="ir-sec-wordpress-blockers"
- se propone un plugin WordPress como consola transaccional principal;
- se exponen rutas Core desde páginas públicas;
- se usan formularios públicos WordPress para pagos;
- se muestran documentos privados desde WordPress;
- se usa sesión WordPress para Core.
```

---

## 20. Registro de riesgos aceptados

Todo riesgo aceptado debe tener:

```text id="ir-sec-risk-acceptance-fields"
riskId
title
description
severity
acceptedBy
acceptedAt
expiresAt
reason
mitigation
reviewDate
```

Reglas:

```text id="ir-sec-risk-acceptance-rules"
- No aceptar riesgos críticos permanentes.
- No aceptar exposición de storageKey.
- No aceptar secretos en repositorio.
- No aceptar rutas públicas transaccionales.
- No aceptar pagos sin auditoría.
- No aceptar WordPress como backend transaccional.
- Riesgo aceptado debe tener expiración.
```

---

## 21. Security checklist de readiness

```text id="ir-sec-checklist"
[ ] security.md actualizado.
[ ] data-governance.md actualizado.
[ ] api-guidelines.md actualizado.
[ ] ADR-004 multitenancy aprobado.
[ ] ADR-005 auth aprobado.
[ ] ADR-006 Keycloak aprobado.
[ ] ADR-007 authorization aprobado.
[ ] ADR-011 testing aprobado.
[ ] ADR-012 CI/CD aprobado.
[ ] Paquetes MVP tienen security-notes.md.
[ ] Paquetes MVP tienen api-contract.md.
[ ] Paquetes MVP tienen test-plan.md.
[ ] No hay storageKey en APIs externas.
[ ] No hay signedUrl persistente.
[ ] No hay WordPress transaccional.
[ ] No hay rutas públicas admin.
[ ] No hay rutas públicas resident.
[ ] No hay datos reales a IA externa.
[ ] No hay pagos sin auditoría.
[ ] No hay documentos fuera de SDS.
[ ] No hay saldos calculados por frontend.
[ ] No hay endpoints improvisados para frontends.
[ ] CI mínimo está definido.
[ ] Tests multitenant están definidos.
[ ] Tests de permisos están definidos.
[ ] Tests de OpenAPI están definidos.
[ ] Secret scanning está definido.
```

---

## 22. Security gates para Sprint 0

Antes de crear código base:

```text id="ir-sec-sprint-0-gates"
[ ] Repositorio creado sin secretos.
[ ] .env.example creado sin credenciales reales.
[ ] .gitignore protege .env.
[ ] CI mínimo creado.
[ ] Docker Compose no contiene secretos reales.
[ ] Keycloak local usa credenciales de desarrollo.
[ ] PostgreSQL local usa datos ficticios.
[ ] No hay dumps reales.
[ ] No hay comprobantes reales.
[ ] No hay documentos privados reales.
```

---

## 23. Security gates para Sprint 1

Antes de implementar módulos reales:

```text id="ir-sec-sprint-1-gates"
[ ] ValidationPipe activo.
[ ] ExceptionFilter seguro.
[ ] Logger sanitizado.
[ ] AuthGuard base.
[ ] TenantGuard base.
[ ] PermissionGuard base.
[ ] OpenAPI base.
[ ] Prisma sin modelos financieros inseguros.
[ ] No float para dinero.
[ ] No hard delete en entidades críticas.
```

---

## 24. Security gates para Sprint 2

Antes de implementar identidad, tenants y permisos:

```text id="ir-sec-sprint-2-gates"
[ ] Keycloak validado localmente.
[ ] keycloakSubjectId -> UserProfile definido.
[ ] Membership model definido.
[ ] Roles/permissions definidos.
[ ] Tenant resolver definido.
[ ] Resource authorization definida.
[ ] Tests de auth definidos.
[ ] Tests de tenant isolation definidos.
[ ] Tests de permission definidos.
```

---

## 25. Security gates para Sprint 3

Antes de implementar finanzas base:

```text id="ir-sec-sprint-3-gates"
[ ] Modelo de dinero usa Decimal.
[ ] Cargos son auditables.
[ ] Pagos son auditables.
[ ] Comprobantes usan SDS.
[ ] Estados de cuenta son derivados.
[ ] Frontend no calcula saldos.
[ ] No validación administrativa desde resident-web.
[ ] No conciliación automática fuera de módulo 017.
[ ] No asientos contables fuera de módulo 020.
```

---

## 26. No aceptación de seguridad

No se acepta Implementation Readiness si:

```text id="ir-sec-no-acceptance"
- permite iniciar desarrollo con gaps críticos abiertos;
- ignora documentos SDD base;
- ignora ADRs;
- ignora specs MVP;
- ignora security-notes en módulos críticos;
- ignora test-plan en módulos críticos;
- ignora api-contract en módulos frontend-facing;
- no define multitenancy;
- no define Keycloak;
- no define autorización Core;
- permite WordPress transaccional;
- permite rutas públicas administrativas;
- permite rutas públicas resident-facing transaccionales;
- permite storageKey en APIs o UI;
- permite documentos fuera de SDS;
- permite pagos sin auditoría;
- permite estados de cuenta independientes no derivados;
- permite frontends sin OpenAPI;
- permite CI ausente;
- permite datos reales a IA externa;
- permite secretos en repositorio;
- permite datos reales en ambiente local;
- permite riesgos críticos permanentes aceptados.
```

---

## 27. Resultado esperado

```text id="ir-sec-expected-result"
security readiness definido
gaps críticos bloqueantes definidos
gaps de alto riesgo definidos
Go/Conditional Go/No-Go protegido
seguridad documental definida
seguridad del repositorio definida
seguridad de ambientes definida
Keycloak readiness definido
multitenancy readiness definido
OpenAPI readiness definido
CI/CD readiness definido
test data security definido
AI usage security definido
WordPress/Core boundary protegido
risk acceptance definido
security checklist definido
sprint security gates definidos
no implementation with critical gaps
no WordPress transactional backend
no public transactional routes
no storageKey exposure
no payments without audit
no frontend without OpenAPI
no real data to external AI
no secrets in repo
```

---

## 28. Expediente actualizado

```text id="ir-sec-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── security-notes.md
```
