# Sprint 0 Closure — Reevaluación formal

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | SPRINT-0-CLOSURE-2026-08-11 |
| Fecha | 2026-08-11 |
| Alcance | Definition of Done de Sprint 0 |
| Commit base | `fdc052b` |
| Rama base | `main` |
| Resultado técnico | `PASS` |
| Cierre formal | `PASS` |

## 2. Propósito

Reevaluar el Definition of Done de
`docs/implementation/sprint-0-foundation.md` después de fusionar el PR #1 y ejecutar
la compuerta obligatoria tanto en el pull request como en el push resultante a `main`.

Esta evaluación no autoriza Sprint 1. Su objetivo es separar el cumplimiento técnico
del sprint de los gaps de cierre que todavía requieren corrección o decisión explícita.

## 3. Evidencia técnica

| Evidencia | Resultado |
| --- | --- |
| PR de Sprint 0 | `#1`, fusionado en `main` mediante `fdc052b` |
| GitHub Actions sobre el PR | `Required CI gates`, exitoso |
| GitHub Actions sobre `main` | ejecución `31474843833`, exitosa en 1m 40s |
| Node.js canónico | `v24.18.0`, verificado mediante fnm |
| pnpm canónico | `11.21.0`, verificado mediante fnm |
| Instalación frozen | exitosa |
| Lint | exitoso en los ocho workspaces |
| Typecheck | exitoso en los ocho workspaces |
| Pruebas | 9 de 9 exitosas |
| OpenAPI tooling | contrato válido mediante Redocly |
| Prisma | schema configuration-only válido con `DATABASE_URL` sintética |
| Docker Compose | configuración válida |
| Servicios locales | 7 de 7 activos y saludables |
| Auditoría de dependencias | sin vulnerabilidades conocidas |
| Secret scanning | 7 commits y workspace actual, sin leaks |
| Build del workspace | exitoso |
| Build de `resident-api` | exitoso con `resident-api:0.1.0-sprint0` |

La inspección confirmó además:

- los cinco packages base tienen manifest, TypeScript strict, entrada, exports,
  scripts y pruebas aplicables;
- `packages/auth` no contiene autenticación ni autorización runtime;
- Prisma no contiene modelos, enums, migraciones ni seeds de dominio;
- no existen `HealthModule`, `PrismaService`, `SwaggerModule` ni `OpenAPIModule`;
- no existe API o persistencia runtime de Implementation Readiness;
- no se detectaron datos reales, secretos reales, `storageKey` expuesto, WordPress
  transaccional ni lógica de negocio productiva.

## 4. Resultado del Definition of Done

Todos los criterios técnicos de §19 del runbook están sustentados y quedan marcados
como completados. Sprint 0 produjo la fundación técnica prevista y respetó la frontera
con Sprint 1.

El cierre formal se declara sustentado porque los dos gaps identificados durante esta
evaluación fueron corregidos y verificados.

## 5. Gaps de cierre

### GAP-S0-CLOSE-001 — Finales de línea no normalizados

| Campo | Valor |
| --- | --- |
| Severidad | Media |
| Estado | closed |
| Evidencia | `.gitattributes` fija `* text=auto eol=lf`; `pnpm format:check` pasa localmente en Windows con `core.autocrlf=true` |

La política LF quedó versionada y los archivos formateables fueron normalizados con
Prettier. `git check-attr` confirma `eol: lf` y el gate completo de formato finalizó con
exit code 0 usando Node.js `24.18.0` y pnpm `11.21.0`.

### GAP-S0-CLOSE-002 — Branch protection parcial frente a ADR-012 §8

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | closed |
| Evidencia | La regla `81580681` exige PR, `Required CI gates`, rama actualizada, protección del administrador y cero aprobaciones bajo la excepción temporal de ADR-012 §8.1 |

El repositorio tiene un solo mantenedor elegible y no opera ambientes ni datos
productivos. ADR-012 v0.2 §8.1 y
`docs/changes/CI-001-single-maintainer-branch-protection.md` formalizan para este
contexto una excepción temporal de cero aprobaciones, sin presentar la autorrevisión
como revisión independiente. La configuración remota conserva PR, CI obligatorio, rama
actualizada, protección del administrador, ausencia de bypass y force-push y eliminación
deshabilitados. La aprobación independiente se reactivará al incorporar un segundo
revisor elegible y se reevaluará antes del primer ambiente o despliegue productivo.

## 6. Observaciones no bloqueantes

- GitHub Actions informa que `actions/checkout@v4`, `actions/setup-node@v4` y
  `pnpm/action-setup@v4` declaran runtime Node.js 20 y están siendo forzadas a Node.js
  24. El workflow pasa, pero las acciones deberán actualizarse mediante un cambio
  separado y validado.
- El build Docker informa que Prisma no detecta OpenSSL en la imagen slim. Sprint 0 no
  ejecuta Prisma en runtime, por lo que no bloquea este cierre técnico; debe resolverse
  antes de introducir `PrismaService` en Sprint 1.
- `pnpm prisma:validate` requiere una `DATABASE_URL`. CI ya usa una URL sintética y la
  ejecución local fue válida al aplicar el mismo patrón.

## 7. Decisión

```text
Technical Definition of Done: PASS
Formal Sprint 0 closure: PASS
Open high gaps: 0
Open medium gaps: 0
Sprint 1 authorization: NOT GRANTED by this evaluation
```

Sprint 0 queda formalmente cerrado. Esta decisión no autoriza por sí sola Sprint 1 ni
lógica de negocio. El siguiente paso es definir y revisar el runbook de Sprint 1 y
someterlo a una compuerta explícita antes de iniciar su implementación.
