# GAP-S4-002 — Contrato OpenAPI tipado y cliente TypeScript determinista

## 1. Estado

| Campo     | Valor                                              |
| --------- | -------------------------------------------------- |
| Gap       | `GAP-S4-002`                                       |
| Severidad | Alta                                               |
| Estado    | `OPEN`                                             |
| Fecha     | 2026-09-12                                         |
| Sprint    | 4 — Admin Web App MVP                              |
| Bloquea   | Fase 2 y consumo funcional de Core desde Admin Web |

## 2. Problema verificable

El artefacto OpenAPI de Sprint 3 enumera la superficie runtime autorizada, pero muchas
respuestas exitosas no contienen schemas suficientes para generar modelos seguros de
consumo. Además, `packages/openapi-client` declara explícitamente estado
`contract-only`; no existe un cliente TypeScript generado y reproducible para
`apps/admin-web`.

Consumir esas operaciones con DTOs manuales duplicaría contratos, debilitaría la
trazabilidad y permitiría divergencia entre runtime, OpenAPI y frontend.

## 3. Contrato que debe cerrarse

El cierre debe establecer:

1. schemas OpenAPI de request y response exitosos para la allowlist de Sprint 4;
2. envelopes, paginación, errores y campos monetarios con tipos canónicos;
3. metadata runtime vigente: `x-auth-required`, `x-public`, `x-platform-only`,
   `x-tenant-scope`, `x-tenant-context-required`, `x-own-resource`,
   `x-required-permission` y `x-idempotency-required`;
4. un generador TypeScript versionado y determinista;
5. output generado con ownership claro en `packages/openapi-client`;
6. una API de consumo estable para `apps/admin-web` sin DTOs manuales paralelos;
7. comprobación de drift y reproducibilidad en CI;
8. política para regenerar y revisar cambios del contrato.

`x-tenant-scope` usa el valor runtime canónico `tenant`, no el booleano preliminar de
Spec 029. La exposición se expresa mediante `x-public`; no se introduce
`x-public-exposure`.

## 4. Seguridad y precisión

- El cliente no decide autorización ni transforma claims en permisos.
- `X-Tenant-Id` se incorpora sólo después de una selección validable y nunca desde
  campos de dominio.
- Operaciones POST tenant-scoped conservan `Idempotency-Key` cuando su metadata lo
  exige.
- Dinero se representa como string decimal según el contrato; no se convierte a
  aritmética binaria para reglas financieras.
- El cliente no expone `storageKey`, signed URLs persistentes, tokens ni datos
  cross-tenant.

## 5. Criterios de cierre

El GAP puede pasar a `CLOSED` sólo cuando el mismo incremento incluya:

- schemas completos para la allowlist de Sprint 4, incluido GAP-S4-001;
- generación determinista y artefacto TypeScript versionado;
- pruebas de compilación, drift y regeneración desde cero;
- prueba de consumo mínima sin implementación de pantallas funcionales;
- ausencia de DTOs manuales duplicados;
- gate reproducible y actualización de `currentPhase` a 2 únicamente después de que
  las Fases 1 y 2 pasen.

## 6. Frontera

Este documento no modifica el OpenAPI, generador, cliente, dependencias ni Admin Web.
Sprint 4 permanece `NO_GO` y `currentPhase = 0`; el trabajo de esta brecha debe ocurrir
después de cerrar GAP-S4-001 y antes de la foundation frontend.
