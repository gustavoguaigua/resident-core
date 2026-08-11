# CI-001 — Excepción temporal de branch protection para mantenedor único

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Cambio | CI-001 |
| Fecha | 2026-08-11 |
| Estado | accepted |
| Alcance | Branch protection de `main` durante la etapa no productiva con un único mantenedor elegible |

## 2. Contexto

ADR-012 exige pull request, CI, revisión y rama actualizada antes del merge. El
repositorio tiene actualmente un solo mantenedor elegible. GitHub no considera una
autorrevisión del autor como aprobación independiente, por lo que exigir una aprobación
dejaría todos los pull requests bloqueados sin añadir una segunda revisión real.

El proyecto permanece en etapa no productiva, no usa datos reales y todavía no ha
autorizado Sprint 1.

## 3. Decisión

Se aprueba temporalmente configurar cero aprobaciones requeridas mientras exista un
solo mantenedor elegible. La excepción queda subordinada a ADR-012 v0.2 §8.1 y no
relaja los demás controles de `main`.

Controles obligatorios durante la excepción:

```text id="ci-001-controls"
- pull request obligatorio;
- Required CI gates obligatorio;
- rama actualizada con main antes del merge;
- protección aplicada al administrador;
- bypass deshabilitado;
- force-push deshabilitado;
- eliminación de main deshabilitada;
- revisión humana y trazabilidad SDD documentadas por el mantenedor.
```

La autorrevisión no se registra ni comunica como aprobación independiente.

## 4. Límites

La excepción:

- no autoriza Sprint 1 ni lógica de negocio;
- no autoriza datos reales ni ambientes productivos;
- no reduce gates de CI, seguridad, migraciones o contratos;
- no sustituye revisión externa para cambios financieros, de seguridad, migraciones
  destructivas o despliegues productivos antes de llegar a producción.

## 5. Condiciones de terminación

La excepción termina cuando ocurra cualquiera de estas condiciones:

1. existe un segundo revisor elegible;
2. se habilita el primer ambiente productivo;
3. se prepara el primer despliegue productivo;
4. una reevaluación de seguridad exige revisión independiente anticipada.

Al terminar la excepción, branch protection debe exigir al menos una aprobación y la
configuración debe verificarse nuevamente en GitHub.

## 6. Documentos afectados

| Documento | Impacto | Actualización directa |
| --- | --- | --- |
| `docs/decisions/ADR-012-ci-cd-strategy.md` | Incorpora §8.1 y alinea las políticas de revisión | Sí |
| `docs/changes/SPRINT-0-CLOSURE-2026-08-11.md` | Sustituye la evidencia de una aprobación por la excepción controlada | Sí |
| Configuración remota de GitHub | Fija cero aprobaciones y conserva los demás controles | Sí |

## 7. Decisión final

```text id="ci-001-decision"
Single-maintainer exception: APPROVED
Required approvals while active: 0
Independent review represented as completed: NO
Automatic quality and protection controls: REQUIRED
Production authorization: NOT GRANTED
```
