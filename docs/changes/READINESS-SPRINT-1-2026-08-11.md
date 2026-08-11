# READINESS-SPRINT-1 — Backend Platform Base

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | `READINESS-SPRINT-1-2026-08-11` |
| Fecha | 2026-08-11 |
| Alcance | Preparación para Sprint 1 — Backend Platform Base |
| Commit base inspeccionado | `09310d5ada31adfc8da4f59243060821257831db` |
| Rama de evaluación | `codex/sprint-1-readiness` |
| Decisión | `GO` |
| Plan autorizado | `docs/implementation/sprint-1-backend-platform-base.md` |
| Naturaleza | Gate documental y técnico previo a implementación |

## 2. Propósito y método

Evaluar si el repositorio cerrado en Sprint 0 dispone de autoridad documental, límites,
contratos y gates suficientes para iniciar la siguiente fase de plataforma backend sin
adelantar funcionalidad de negocio.

La evaluación aplicó la precedencia de `AGENTS.md`, contrastó el estado real del
repositorio con la constitución, ADRs, Blueprint, specs, arquitectura, seguridad, API,
datos y cierre de Sprint 0. También revisó las versiones públicas de las dependencias
previstas; no instaló paquetes ni ejecutó implementación.

## 3. Evidencia inspeccionada

| Evidencia | Resultado |
| --- | --- |
| Documentos activos de `AGENTS.md` | Presentes y revisados |
| ADRs aplicables | Aceptados; autorizan la base técnica propuesta |
| Spec 031, secuencia Fase 1 | Define los diez componentes de Sprint 1 |
| Specs 001–030 | `needs-review`; excluidas de implementación funcional |
| Sprint 0 | DoD y cierre formal `PASS` |
| Rama permanente | `main`, protegida y con CI obligatorio |
| Workspace | Node.js 24.18.0 y pnpm 11.21.0 fijados |
| API NestJS | Scaffold compilable, sin runtime de plataforma todavía |
| Prisma | Tooling y schema sin modelos; no existen migraciones ni seeds |
| OpenAPI | Tooling placeholder; runtime y contrato pendientes para Sprint 1 |
| Docker Compose | Siete servicios obligatorios; API aún sin conexión PostgreSQL |
| CI | Gates base activos; gates runtime identificados para activación incremental |
| Secretos o datos reales requeridos | Ninguno |

## 4. Gaps evaluados y resolución

| Gap | Severidad inicial | Resolución en el runbook | Estado |
| --- | --- | --- | --- |
| `GAP-S1-001` — `NODE_ENV`, `APP_ENV`, `PORT` y `API_PORT` no formaban un contrato único | Alta | Dos ejes de entorno; `API_PORT` canónico | Cerrado |
| `GAP-S1-002` — readiness detallada requiere protección antes de integrar Keycloak | Crítica | Excepción local limitada a loopback; fuera de local falla cerrado | Cerrado |
| `GAP-S1-003` — no estaba definido qué dependencias degradan health en Sprint 1 | Alta | Solo PostgreSQL requerida; demás `notConfigured` | Cerrado |
| `GAP-S1-004` — OpenAPI placeholder sin contrato runtime ni drift gate | Alta | Artefacto canónico, generación determinista y `openapi:check` | Cerrado |
| `GAP-S1-005` — Docker no incluía schema/generación Prisma y existía riesgo OpenSSL | Alta | Tareas explícitas de build Prisma y OpenSSL | Cerrado |
| `GAP-S1-006` — esqueletos podían confundirse con auth/tenant/audit funcional | Crítica | Límites modulares, fail-closed y exclusiones explícitas | Cerrado |
| `GAP-S1-007` — gates CI runtime aún no estaban activados | Alta | Activación incremental de integración, API y OpenAPI | Cerrado |

No quedan gaps críticos o altos sin decisión. Las resoluciones son restricciones
obligatorias del plan autorizado, no opciones de implementación.

## 5. Matriz de decisión

| Criterio | Resultado | Evidencia |
| --- | --- | --- |
| Sprint 0 está cerrado | Cumple | `SPRINT-0-CLOSURE-2026-08-11.md` |
| Existe autoridad para las capacidades de plataforma | Cumple | Spec 031 Fase 1 y ADRs 002–012 aplicables |
| Alcance y no alcance son verificables | Cumple | Runbook §§3 y 8–9 |
| Contrato health está cerrado | Cumple | ADR-010 §10 y runbook §4.4 |
| Prisma no adelanta dominio | Cumple | ADR-003 y runbook §4.5 |
| OpenAPI tiene artefacto y drift gate definidos | Cumple | ADR-011/012 y runbook §4.6 |
| Seguridad falla cerrada antes de Keycloak | Cumple | Runbook §§4.4 y 4.7 |
| CI activa los gates correspondientes a API runtime | Cumple | ADR-012 §10.2 y runbook §6 |
| No se requiere una nueva decisión arquitectónica | Cumple | Se aplican ADRs vigentes sin alterar estrategia |
| No existen gaps críticos o altos abiertos | Cumple | 7 de 7 gaps cerrados por contrato |

## 6. Decisión vigente

```text id="sprint1-readiness-decision"
Decision: GO
Scope: Sprint 1 — Backend Platform Base únicamente
Effective date: 2026-08-11
Critical gaps open: 0
High gaps open: 0
Authorized plan: docs/implementation/sprint-1-backend-platform-base.md
Base commit: 09310d5ada31adfc8da4f59243060821257831db
```

El `GO` autoriza implementar el runbook en ramas cortas y PRs protegidos. Cada capacidad
debe incorporar sus pruebas y gates en el mismo cambio que la activa.

## 7. Límites y salvaguardas

Esta decisión no autoriza:

- Sprint 2 ni ninguna spec funcional 001–030;
- modelos Prisma, migraciones, seeds o repositorios de dominio;
- integración Keycloak, validación JWT o login;
- tenant resolution o autorización funcional;
- persistencia de auditoría;
- API o persistencia de Implementation Readiness;
- frontends funcionales, producción o infraestructura no local;
- datos reales, secretos reales o bypasses de seguridad.

El endpoint detallado de health deberá fallar cerrado fuera de local hasta que Sprint 2
aporte identidad y el permiso `platform.health.read`. Esta limitación impide despliegues
no locales durante Sprint 1, pero no bloquea la implementación y validación local
autorizadas.

## 8. Riesgos no bloqueantes

| Riesgo | Tratamiento | Requerido antes de |
| --- | --- | --- |
| No existe segundo reviewer permanente | Excepción aprobada para mantenedor único en ADR-012 v0.2 | Incorporar otro mantenedor |
| Keycloak no está integrado | Mantener guards y health fail-closed | Cualquier despliegue no local o Sprint 2 |
| No existe infraestructura productiva | Sprint 1 se limita a local/CI | Staging o producción |
| Specs 001–030 siguen `needs-review` | No implementar funcionalidad de esas specs | Sprint 2 o sprint funcional aplicable |

## 9. Resultado

El repositorio está preparado para comenzar Sprint 1 dentro del alcance estricto de
Backend Platform Base. El siguiente paso autorizado es implementar el PR 1 de
configuración y bootstrap seguro descrito en el runbook. Sprint 2 permanece no
autorizado.
