# Sprint 1 Closure — Candidato de cierre formal

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | `SPRINT-1-CLOSURE-2026-08-11` |
| Fecha | 2026-08-11 |
| Alcance | Definition of Done de Sprint 1 — Backend Platform Base |
| Commit base | `eb0f977` |
| Rama de implementación | `codex/sprint-1-security-audit-skeletons` |
| Resultado técnico local | `PASS` |
| CI remota | `PASS` — run `31555482685` |
| Cierre formal | `PENDING_PR4_MERGE` |

## 2. Propósito

Consolidar la evidencia de los cuatro incrementos del runbook
`docs/implementation/sprint-1-backend-platform-base.md` sin declarar cerrado el sprint
antes de fusionar el PR 4.

## 3. Alcance implementado

- PR 1: configuración validada, bootstrap HTTP seguro, errores, trazabilidad, logging,
  CORS, Helmet y rate limiting.
- PR 2: integración técnica de Prisma sin modelos de dominio y endpoints de liveness y
  readiness conforme a ADR-010.
- PR 3: OpenAPI runtime, exposición restringida, contrato canónico y control de drift.
- PR 4: puertos y guards fail-closed para identidad, tenant y permisos; puerto e
  interceptor de auditoría sin persistencia; compuerta automática de frontera.

Los módulos de seguridad no se registran globalmente y sus adaptadores por defecto no
autentican, no resuelven tenant y no conceden permisos. El interceptor de auditoría no
promete durabilidad ni escribe en base de datos.

## 4. Evidencia local

| Evidencia | Resultado |
| --- | --- |
| Instalación frozen | exitosa |
| Formato | exitoso |
| Lint | exitoso |
| Typecheck | exitoso |
| Pruebas unitarias | 29 de 29 exitosas |
| Pruebas de integración | 1 de 1 exitosa |
| Pruebas API y contrato | 12 de 12 exitosas |
| OpenAPI generate/check | contrato determinista y sin drift |
| Redocly | contrato válido; una advertencia aceptada para liveness pública |
| Prisma generate/validate | exitoso con `DATABASE_URL` sintética |
| Auditoría de dependencias | sin vulnerabilidades conocidas |
| Secret scanning | sin leaks detectados |
| Build del workspace | exitoso |
| Docker Compose | configuración válida |
| Build de `resident-api` | exitoso |
| Runtime de `resident-api` | contenedor saludable y liveness `200` |
| Frontera Sprint 1 | sin modelos, enums, migraciones, seeds ni endpoints de dominio |
| GitHub Actions | `Required CI gates`, run `31555482685`, exitoso en 2m 58s |

Durante el smoke test se detectó que la imagen de ejecución no incluía el nuevo
workspace `@resident/auth`. El Dockerfile fue corregido para copiar su manifest y su
build, y la reconstrucción posterior arrancó correctamente con los módulos de
identidad, control de acceso y auditoría.

## 5. Frontera confirmada

No se implementaron:

- integración con Keycloak, login o validación JWT;
- resolución funcional de tenant, roles o permisos;
- modelos, enums, migraciones o seeds Prisma de dominio;
- persistencia de auditoría;
- endpoints de tenants, usuarios, residentes u otros dominios;
- lógica de negocio de Sprint 2.

## 6. Decisión

```text
Local implementation gates: PASS
Sprint 1 authorized scope: IMPLEMENTED
Remote required CI: PASS (run 31555482685)
PR 4 merge to main: PENDING
Formal Sprint 1 closure: PENDING_PR4_MERGE
```

El PR 4 superó `Required CI gates` en el run `31555482685`. El candidato de cierre se
convierte en cierre formal únicamente cuando el PR se fusiona en `main`.
